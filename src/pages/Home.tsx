import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
    const [playerId, setPlayerId] = useState('');
    const navigate = useNavigate();

    const handleStart = (e: React.FormEvent) => {
        e.preventDefault();
        if (!playerId.trim()) {
            alert('請輸入你的 ID！');
            return;
        }
        // Navigate to quiz with player ID
        navigate('/quiz', { state: { playerId } });
    };

    return (
        <div className="nes-container is-dark with-title" style={{ textAlign: 'center', marginTop: '10vh' }}>
            <p className="title">Pixel Quiz Game</p>

            <div style={{ padding: '20px 0' }}>
                <i className="nes-icon is-large star"></i>
            </div>

            <p style={{ marginBottom: '30px' }}>歡迎來到復古像素挑戰！<br />請輸入您的 ID 以開始遊戲。</p>

            <form onSubmit={handleStart}>
                <div className="nes-field">
                    <input
                        type="text"
                        className="nes-input"
                        placeholder="Enter your ID..."
                        value={playerId}
                        onChange={(e) => setPlayerId(e.target.value)}
                    />
                </div>
                <button type="submit" className="nes-btn is-primary" style={{ width: '100%', marginTop: '20px' }}>
                    START GAME
                </button>
            </form>
        </div>
    );
}

export default Home;
