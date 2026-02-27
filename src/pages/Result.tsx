import { useLocation, useNavigate } from 'react-router-dom';

function Result() {
    const location = useLocation();
    const navigate = useNavigate();

    const { success, score, isPassed, playerId } = location.state || {};

    if (!success) {
        return (
            <div className="nes-container is-dark with-title" style={{ textAlign: 'center', marginTop: '10vh' }}>
                <p className="title">System Error</p>
                <p>找不到成績紀錄。</p>
                <button className="nes-btn" onClick={() => navigate('/')} style={{ marginTop: '20px' }}>
                    回首頁
                </button>
            </div>
        );
    }

    return (
        <div className="nes-container is-dark with-title" style={{ textAlign: 'center', marginTop: '10vh' }}>
            <p className="title">Mission Complete</p>

            <div style={{ padding: '20px 0' }}>
                {isPassed ? (
                    <>
                        <i className="nes-icon trophy is-large"></i>
                        <h2 className="nes-text is-success" style={{ marginTop: '20px' }}>STAGE CLEAR!</h2>
                        <p style={{ marginTop: '20px' }}>恭喜通關，勇者 {playerId}！</p>
                    </>
                ) : (
                    <>
                        <i className="nes-icon close is-large"></i>
                        <h2 className="nes-text is-error" style={{ marginTop: '20px' }}>GAME OVER</h2>
                        <p style={{ marginTop: '20px' }}>勝敗乃兵家常事，大俠請重新來過。</p>
                    </>
                )}
            </div>

            <div className="nes-container is-rounded is-dark" style={{ margin: '20px 0' }}>
                <p>本次得分: <strong>{score}</strong></p>
            </div>

            <button className="nes-btn is-primary" onClick={() => navigate('/')} style={{ width: '100%', marginTop: '20px' }}>
                PLAY AGAIN
            </button>
        </div>
    );
}

export default Result;
