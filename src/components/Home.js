import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';

const Home = () => {
    const [selectedMode, setSelectedMode] = useState(null);
    const [customValue, setCustomValue] = useState('');
    const [customType, setCustomType] = useState('questions');
    const [customLives, setCustomLives] = useState(3); // État pour les vies
    const navigate = useNavigate();

    const gameModes = [
        { id: '10', name: 'question-limit', class: '10 questions', description: 'Répondez à 10 questions sur les drapeaux.' },
        { id: '20', name: 'question-limit', class: '20 questions', description: 'Répondez à 20 questions sur les drapeaux.' },
        { id: '60', name: 'time-limit', class: '60 secondes', description: 'Répondez à autant de questions que possible en 60 secondes.' },
        { id: 'survival', name: 'Survie', class: 'Survie', description: 'Continuez à répondre correctement pour rester en vie. Une seule vie.' },
        { id: 'custom', name: 'Custom', class: 'Custom', description: 'Choisissez votre propre mode de jeu personnalisé.' },
    ];

    const handleModeSelect = (mode) => {
        setSelectedMode(mode);
        if (mode.id !== 'custom') {
            setCustomValue('');
            setCustomLives(1); // Réinitialiser les vies pour les autres modes
        }
    };

    const handleStart = () => {
        if (selectedMode) {
            let limitValue = selectedMode.id;
            if (selectedMode.name === 'time-limit') {
                limitValue = `time-limit${limitValue}`; 
            } else if (selectedMode.id === 'custom') {
                if (customType === 'survival') {
                    limitValue = `survival-lives${customLives}`;
                } else {
                    const parsedValue = parseInt(customValue, 10);
                    if (customValue && parsedValue > 0) {
                        limitValue = customType === 'questions' ? parsedValue.toString() : `time-limit${parsedValue}`;
                    } else {
                        console.error('Custom value is invalid:', customValue);
                        return;
                    }
                }
            }
            console.log('Navigating to /quiz with limit:', limitValue);
            
            localStorage.setItem('quizModeClass', selectedMode.class);
            localStorage.setItem('quizModeType', customType);
            localStorage.setItem('quizModeValue', customValue);
            localStorage.setItem('quizModeLives', customLives); // Stocker le nombre de vies

            navigate('/quiz', { state: { limit: limitValue } });
        }
    };

    const isStartDisabled = () => {
        if (!selectedMode) return true;
        if (selectedMode.id === 'custom') {
            if (customType === 'survival') return customLives < 1 || customLives > 5;
            const parsedValue = parseInt(customValue, 10);
            return !customValue || parsedValue <= 0;
        }
        return false;
    };

    const handleCustomValueChange = (e) => {
        const value = e.target.value;
        if (value === '' || parseInt(value, 10) > 0) {
            setCustomValue(value);
        }
    };

    const handleCustomLivesChange = (e) => {
        const value = e.target.value;
        const parsedValue = parseInt(value, 10);
        if (!isNaN(parsedValue) && parsedValue >= 1 && parsedValue <= 5) {
            setCustomLives(parsedValue);
        } else if (value === '') {
            setCustomLives('');
        }
    };

    return (
        <div className="home-container">
            <div className="mode-list">
                {gameModes.map((mode) => (
                    <div
                        key={mode.id}
                        className={`mode-item ${selectedMode?.id === mode.id ? 'selected' : ''}`}
                        onClick={() => handleModeSelect(mode)}
                    >
                        {mode.class}
                    </div>
                ))}
            </div>
            <div className="mode-description">
                {selectedMode ? (
                    <>
                        <h2>{selectedMode.class}</h2>
                        <p>{selectedMode.description}</p>
                        {selectedMode.id === 'custom' && (
                            <div className="custom-options">
                                <label>
                                    <input
                                        type="radio"
                                        value="questions"
                                        checked={customType === 'questions'}
                                        onChange={() => setCustomType('questions')}
                                    />
                                    Nombre de questions
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        value="time"
                                        checked={customType === 'time'}
                                        onChange={() => setCustomType('time')}
                                    />
                                    Limite de temps (en secondes)
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        value="survival"
                                        checked={customType === 'survival'}
                                        onChange={() => setCustomType('survival')}
                                    />
                                    Mode Survie
                                </label>
                                {customType === 'survival' ? (
                                    <div className="lives-selector">
                                        <label>
                                            Nombre de vies :
                                            <input
                                                type="number"
                                                value={customLives}
                                                onChange={handleCustomLivesChange}
                                                min="1"
                                                max="5"
                                                placeholder="1-5"
                                            />
                                            {[...Array(5)].map((_, i) => (
                                                <FontAwesomeIcon
                                                    key={i}
                                                    icon={faHeart}
                                                    style={{
                                                        color: i < customLives ? 'red' : 'grey',
                                                        marginLeft: '5px'
                                                    }}
                                                />
                                            ))}
                                        </label>
                                    </div>
                                ) : (
                                    <input
                                        type="number"
                                        value={customValue}
                                        onChange={handleCustomValueChange}
                                        placeholder={customType === 'questions' ? 'Entrez le nombre de questions' : 'Entrez le temps en secondes'}
                                        min="1"
                                    />
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    <p>Sélectionnez un mode de jeu pour voir la description.</p>
                )}
            </div>
            {selectedMode && (
                <div className="start-button-container">
                    <button
                        className={`start-button ${isStartDisabled() ? 'disabled' : ''}`}
                        onClick={handleStart}
                        disabled={isStartDisabled()}
                    >
                        Start
                    </button>
                </div>
            )}
        </div>
    );
};

export default Home;
