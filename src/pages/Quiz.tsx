import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Question {
    id: string;
    question: string;
    options: {
        A: string;
        B: string;
        C: string;
        D: string;
    };
}

interface AnswerRecord {
    id: string;
    answer: string;
}

function Quiz() {
    const location = useLocation();
    const navigate = useNavigate();
    const playerId = location.state?.playerId;

    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answers, setAnswers] = useState<AnswerRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // 預先產生關主圖片 seed
    const [seeds, setSeeds] = useState<string[]>([]);

    useEffect(() => {
        if (!playerId) {
            navigate('/');
            return;
        }

        const fetchQuestions = async () => {
            try {
                const gasUrl = import.meta.env.VITE_GOOGLE_APP_SCRIPT_URL;
                const limitStr = import.meta.env.VITE_QUESTION_COUNT || "5";
                const limit = parseInt(limitStr, 10);

                // 如果沒有填寫 GAS URL，我們可以提供假資料方便測試 UI
                if (!gasUrl || gasUrl.trim() === "") {
                    console.warn("未設定 VITE_GOOGLE_APP_SCRIPT_URL，使用假資料測試");
                    // Ensure limit is a positive number
                    const finalLimit = Math.max(1, isNaN(limit) ? 5 : limit);

                    const mockQs = Array.from({ length: finalLimit }).map((_, i) => ({
                        id: `Q${i + 1}`,
                        question: `這是測試題目 ${i + 1}，請問答案是什麼？`,
                        options: { A: '選項 A', B: '選項 B', C: '選項 C', D: '選項 D' }
                    }));
                    setQuestions(mockQs);
                    setSeeds(mockQs.map((q) => q.id + Date.now()));
                    setLoading(false);
                    return;
                }

                const res = await axios.get(`${gasUrl}?limit=${limit}`);
                if (Array.isArray(res.data)) {
                    setQuestions(res.data);
                    // 為每一題產生不同的 seed 給 DiceBear
                    setSeeds(res.data.map(q => q.id + playerId + Date.now()));
                } else {
                    setErrorMsg('取得題目失敗，回傳格式錯誤。詳細內容: ' + JSON.stringify(res.data));
                }
            } catch (err) {
                console.error(err);
                setErrorMsg('無法連接到伺服器取得題目。');
            } finally {
                setLoading(false);
            }
        };

        fetchQuestions();
    }, [playerId, navigate]);

    const handleOptionSelect = async (optionKey: string) => {
        const currentQ = questions[currentIdx];
        const newAnswers = [...answers, { id: currentQ.id, answer: optionKey }];
        setAnswers(newAnswers);

        if (currentIdx < questions.length - 1) {
            setCurrentIdx(currentIdx + 1);
        } else {
            // 最後一題，送出答案
            await submitAnswers(newAnswers);
        }
    };

    const submitAnswers = async (finalAnswers: AnswerRecord[]) => {
        setSubmitting(true);
        const gasUrl = import.meta.env.VITE_GOOGLE_APP_SCRIPT_URL;
        const passThreshold = import.meta.env.VITE_PASS_THRESHOLD || 3;

        if (!gasUrl) {
            // 假資料測試用
            setTimeout(() => {
                navigate('/result', {
                    state: {
                        success: true,
                        score: 3,
                        isPassed: true,
                        playerId
                    }
                });
            }, 1500);
            return;
        }

        try {
            const payload = {
                id: playerId,
                answers: finalAnswers,
                passThreshold: parseInt(passThreshold.toString(), 10)
            };

            // CORS 問題通常在 GAS doPost 會使用 text/plain 的 fetch 方式或是 jsonp
            // axios 預設 POST 會發送 preflight (OPTIONS)，GAS 不支援 preflight
            // 建議寫法：使用 fetch API 配 no-cors，但這樣拿不到 response，
            // 所以 GAS 常見作法是使用 form-urlencoded 或是 follow redirects 獲取 JSON
            // 使用 axios 時確保 content-type 為 text/plain 可避免預檢請求
            const res = await axios.post(gasUrl, JSON.stringify(payload), {
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8',
                }
            });

            if (res.data.success) {
                navigate('/result', {
                    state: {
                        success: true,
                        score: res.data.score,
                        isPassed: res.data.isPassed,
                        playerId
                    }
                });
            } else {
                setErrorMsg('儲存成績失敗：' + res.data.error);
                setSubmitting(false);
            }
        } catch (err) {
            console.error(err);
            setErrorMsg('傳送成績時發生網路錯誤。');
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="nes-container is-dark with-title" style={{ textAlign: 'center', marginTop: '10vh' }}>
                <p className="title">Loading</p>
                <p className="loading-text" style={{ margin: '20px 0' }}>載入關主與題目中...</p>
            </div>
        );
    }

    if (errorMsg) {
        return (
            <div className="nes-container is-dark with-title" style={{ textAlign: 'center', marginTop: '10vh' }}>
                <p className="title">Error</p>
                <p className="nes-text is-error">{errorMsg}</p>
                <button className="nes-btn" onClick={() => navigate('/')} style={{ marginTop: '20px' }}>
                    回首頁
                </button>
            </div>
        );
    }

    if (submitting) {
        return (
            <div className="nes-container is-dark with-title" style={{ textAlign: 'center', marginTop: '10vh' }}>
                <p className="title">Processing</p>
                <p className="loading-text" style={{ margin: '20px 0' }}>計算成績與連線中...</p>
            </div>
        );
    }

    const currentQuestion = questions[currentIdx];
    const currentSeed = seeds[currentIdx] || 'default';
    const avatarUrl = `https://api.dicebear.com/9.x/pixel-art/svg?seed=${currentSeed}`;

    if (!currentQuestion) {
        return (
            <div className="nes-container is-dark with-title" style={{ textAlign: 'center', marginTop: '10vh' }}>
                <p className="title">Error</p>
                <p>找不到題目資料。</p>
                <button className="nes-btn" onClick={() => navigate('/')} style={{ marginTop: '20px' }}>
                    回首頁
                </button>
            </div>
        );
    }

    return (
        <div className="nes-container is-dark with-title" style={{ marginTop: '5vh' }}>
            <p className="title">Stage {currentIdx + 1} / {questions.length}</p>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
                <div className="nes-container is-rounded" style={{ padding: '10px', backgroundColor: '#fff', display: 'inline-block' }}>
                    <img src={avatarUrl} alt="關主" style={{ width: '120px', height: '120px', imageRendering: 'pixelated' }} />
                </div>
                <div className="nes-balloon from-left" style={{ marginTop: '20px', width: '100%' }}>
                    <p>{currentQuestion.question}</p>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {Object.entries(currentQuestion.options).map(([key, value]) => (
                    <button
                        key={key}
                        className="nes-btn"
                        onClick={() => handleOptionSelect(key)}
                        style={{ textAlign: 'left', textTransform: 'none' }}
                    >
                        {key}. {value}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default Quiz;
