import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Quiz.css';
import { useAppContext } from '../AppContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faHeart } from '@fortawesome/free-solid-svg-icons';

const Quiz = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { limit: contextLimit, setAnswers } = useAppContext();
    const [flagImages, setFlagImages] = useState({});
    const [flagsQueue, setFlagsQueue] = useState([]);
    const [selectedFlag, setSelectedFlag] = useState(null);
    const [choices, setChoices] = useState([]);
    const [answeredQuestions, setAnsweredQuestions] = useState(0);
    const [secondsLeft, setSecondsLeft] = useState(null); 
    const [livesLeft, setLivesLeft] = useState(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [loading, setLoading] = useState(true);

    const limit = location.state?.limit || contextLimit;

    // Fonction pour mélanger un tableau
    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    // Fonction pour générer les choix pour une question
    const generateChoices = useCallback((correctFlagName) => {
        const flagNames = Object.keys(flagImages);
        let choicesArray = [correctFlagName.replace('.png', '')];
        
        while (choicesArray.length < 4) {
            const randomIndex = Math.floor(Math.random() * flagNames.length);
            const randomFlag = flagNames[randomIndex].replace('.png', '');
            if (!choicesArray.includes(randomFlag) && randomFlag !== correctFlagName.replace('.png', '')) {
                choicesArray.push(randomFlag);
            }
        }
        
        choicesArray = shuffleArray(choicesArray);
        setChoices(choicesArray);
    }, [flagImages]);

    useEffect(() => {
        let initialLives = null;

        if (typeof limit === 'string' && limit.includes('survival-lives')) {
            initialLives = parseInt(limit.replace('survival-lives', ''), 10);
        } else if (limit === 'survival') {
            initialLives = 1;
        }

        if (initialLives !== null) {
            setLivesLeft(initialLives);
            localStorage.setItem('quizModeLives', initialLives); 
        }

        localStorage.setItem('quizMode', limit);

        if (typeof limit === 'string' && limit.includes('time-limit')) {
            const totalTime = parseInt(limit.replace('time-limit', ''), 10) || 60;
            setSecondsLeft(totalTime);

            const intervalId = setInterval(() => {
                setSecondsLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(intervalId);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(intervalId);
        } else if (!isNaN(parseInt(limit, 10)) && parseInt(limit, 10) > 0) {
            const totalQuestions = parseInt(limit, 10);
            setFlagsQueue(prevQueue => prevQueue.slice(0, totalQuestions));
        }
    }, [limit]);

    useEffect(() => {
        if (secondsLeft === 0 || (answeredQuestions >= parseInt(limit, 10)) || (livesLeft === 0 && limit.includes('survival'))) {
            navigate('/results', { state: { questionsAnswered: answeredQuestions } });
        }
    }, [secondsLeft, answeredQuestions, limit, livesLeft, navigate]);

    useEffect(() => {
        const importAll = (r) => {
            let images = {};
            r.keys().map((item) => {
                images[item.replace('./', '')] = r(item);
                return null;
            });
            return images;
        };

        const images = importAll(require.context('../assets/flags', false, /\.(png)$/));
        setFlagImages(images);

        console.log(`Total flags loaded: ${Object.keys(images).length}`);

        let flagsToUse = Object.keys(images);
        if (!isNaN(parseInt(limit, 10)) && parseInt(limit, 10) > 0) {
            flagsToUse = shuffleArray(flagsToUse).slice(0, parseInt(limit, 10));
        } else {
            flagsToUse = shuffleArray(flagsToUse);
        }
        setFlagsQueue(flagsToUse);

        // Précharger toutes les images dans le cache
        Object.values(images).forEach(src => {
            const img = new Image();
            img.src = src;
        });

        setLoading(false); // Le chargement est terminé
    }, [limit]);

    useEffect(() => {
        if (flagsQueue.length > 0) {
            const nextFlag = flagsQueue[0];
            setSelectedFlag({
                name: nextFlag,
                image: flagImages[nextFlag]
            });
            generateChoices(nextFlag.replace('.png', ''));

            // Précharger l'image de la question suivante
            if (flagsQueue.length > 1) {
                const upcomingFlag = flagsQueue[1];
                const img = new Image();
                img.src = flagImages[upcomingFlag];
            }
        } else {
            // Si la queue est vide, redirigez vers la page des résultats
            navigate('/results', { state: { questionsAnswered: answeredQuestions } });
        }
    }, [flagsQueue, flagImages, generateChoices, navigate, answeredQuestions]);

    const handleAnswer = (selectedChoice) => {
        setAnsweredQuestions(prevCount => prevCount + 1);

        setAnswers(prevAnswers => {
            const updatedAnswers = [...prevAnswers, {
                question: selectedFlag.name.replace('.png', ''),
                userAnswer: selectedChoice,
                correctAnswer: selectedFlag.name.replace('.png', ''),
                isCorrect: selectedChoice === selectedFlag.name.replace('.png', ''),
                image: selectedFlag.image,
                choices: choices 
            }];

            localStorage.setItem('quizAnswers', JSON.stringify(updatedAnswers));
            return updatedAnswers;
        });

        if (limit.includes('survival')) {
            if (selectedChoice !== selectedFlag.name.replace('.png', '')) {
                setLivesLeft(prevLives => {
                    const updatedLives = prevLives - 1;
                    if (updatedLives <= 0) {
                        return 0;
                    }
                    return updatedLives;
                });
            }
            setFlagsQueue(prevQueue => prevQueue.slice(1)); // Passer à la question suivante
        } else {
            setFlagsQueue(prevQueue => prevQueue.slice(1)); // Passer à la question suivante
        }
    }

    const questionsRemaining = !isNaN(parseInt(limit, 10)) ? parseInt(limit, 10) - answeredQuestions : null;

    const handleHomeClick = () => {
        setShowConfirmation(true);
    }

    const handleConfirmLeave = () => {
        setShowConfirmation(false);
        navigate('/'); 
    }

    const handleCancelLeave = () => {
        setShowConfirmation(false);
    }

    return (
        <div className="quiz-container">
            {loading ? (
                <div className="spinner">Chargement...</div>
            ) : (
                <>
                    {(typeof limit === 'string' && limit.includes('time-limit')) || secondsLeft !== null ? (
                        <div className="timer">{secondsLeft} secondes restantes</div>
                    ) : null}
                    {questionsRemaining !== null && (
                        <div className="questions-remaining">
                            Questions restantes : {questionsRemaining}
                        </div>
                    )}

                    {limit.includes('survival') && livesLeft !== null && (
                        <div className="lives-container">
                            {[...Array(5)].map((_, i) => (
                                <FontAwesomeIcon
                                    key={i}
                                    icon={faHeart}
                                    style={{
                                        color: i < livesLeft ? 'red' : 'grey',
                                        marginLeft: '5px'
                                    }}
                                />
                            ))}
                        </div>
                    )}

                    <button className="home-button" onClick={handleHomeClick}>
                        <FontAwesomeIcon icon={faHome} />
                    </button>

                    <div className="flag-container">
                        <img src={selectedFlag && selectedFlag.image} alt="Flag" className="flag-image" />
                    </div>
                    <div className="button-container">
                        {choices.map((choice, index) => (
                            <button key={index} onClick={() => handleAnswer(choice)}>{choice}</button>
                        ))}
                    </div>

                    {showConfirmation && (
                        <div className="confirmation-popup">
                            <p>Êtes-vous sûr de vouloir quitter le quiz ? Votre progression sera perdue.</p>
                            <button onClick={handleConfirmLeave}>Oui</button>
                            <button onClick={handleCancelLeave}>Non</button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default Quiz;
