import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../AppContext'; // Import du contexte AppContext
import './Results.css'; // Import du fichier de styles CSS
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';

const Results = () => {
    const navigate = useNavigate();
    const { setAnswers } = useAppContext(); // Ajout de setAnswers pour réinitialiser les réponses
    const [questionsAnswered, setQuestionsAnswered] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [answers, setAnswersState] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [gameModeClass, setGameModeClass] = useState('');
    const [gameModeType, setGameModeType] = useState('');
    const [gameModeValue, setGameModeValue] = useState('');
    const [gameModeLives, setGameModeLives] = useState('');

    useEffect(() => {
        // Lire les réponses depuis le localStorage
        const storedAnswers = JSON.parse(localStorage.getItem('quizAnswers')) || [];
        setAnswersState(storedAnswers);

        // Calculer le nombre de réponses correctes
        const correctAnswers = storedAnswers.filter(answer => answer.isCorrect);
        setCorrectCount(correctAnswers.length);

        // Mettre à jour le nombre de questions répondues
        setQuestionsAnswered(storedAnswers.length);

        // Lire le mode de jeu et la valeur depuis le localStorage
        const storedModeClass = localStorage.getItem('quizModeClass') || 'Non défini';
        const storedModeType = localStorage.getItem('quizModeType') || 'Non défini';
        const storedModeValue = localStorage.getItem('quizModeValue') || '';
        const storedModeLives = localStorage.getItem('quizModeLives') || '';
        setGameModeClass(storedModeClass);
        setGameModeType(storedModeType);
        setGameModeValue(storedModeValue);
        setGameModeLives(storedModeLives);
    }, []);

    const handleHomeClick = () => {
        setShowPopup(true);
    };

    const handleConfirmHome = () => {
        setShowPopup(false);
        // Réinitialiser les réponses
        setAnswers([]);
        localStorage.removeItem('quizAnswers');
        localStorage.removeItem('quizModeClass'); // Réinitialiser le mode de jeu
        localStorage.removeItem('quizModeType'); // Réinitialiser le type du mode de jeu
        localStorage.removeItem('quizModeValue'); // Réinitialiser la valeur du mode de jeu
        localStorage.removeItem('quizModeLives'); // Réinitialiser le nombre de vies
        // Retourner à la page d'accueil après réinitialisation
        navigate('/');
    };

    const handleCancelHome = () => {
        setShowPopup(false);
    };

    return (
        <div className="results-container">
            <h2>Résultats</h2>
            <p>
                Mode de jeu: {gameModeClass || "Non défini"}
                {gameModeClass === 'Custom' && (
                    ` | Type: ${gameModeType || 'Non défini'} | Valeur: ${gameModeValue} ${gameModeType === 'survival' ? (gameModeLives ? `${gameModeLives} cœur/s` : 'Non défini') : (gameModeType === 'questions' ? 'question/s' : 'seconde/s')}`
                )}
                {gameModeClass === 'Survie' && ` | Type: ${gameModeClass}`}
            </p>
            <p>Questions Répondues: {questionsAnswered || "Non défini"}</p>
            <p>Nombre de réponses correctes: {correctCount || 0}</p>
            <div className="answers-container">
                <h3>Réponses:</h3>
                <ul className="answers-list">
                    {answers && answers.length > 0 ? (
                        answers.map((answer, index) => (
                            <li key={index} className="answer-item">
                                <div className="flag-container">
                                    <img src={answer.image} alt="Flag" className="result-flag-image" />
                                </div>
                                <div className="options-container">
                                    {answer.choices && answer.choices.map((choice, i) => (
                                        <div
                                            key={i}
                                            className={`option ${
                                                answer.userAnswer === choice
                                                    ? answer.isCorrect
                                                        ? 'correct'
                                                        : 'incorrect'
                                                    : choice === answer.correctAnswer
                                                    ? 'correct-answer'
                                                    : ''
                                            }`}
                                        >
                                            {choice}
                                        </div>
                                    ))}
                                </div>
                            </li>
                        ))
                    ) : (
                        <li>Aucune réponse disponible.</li>
                    )}
                </ul>
            </div>

            <button className="home-button" onClick={handleHomeClick}>
                <FontAwesomeIcon icon={faHome} />
            </button>

            {showPopup && (
                <div className="confirmation-popup">
                    <p>Voulez-vous vraiment quitter ? Votre progression sera perdue.</p>
                    <button onClick={handleConfirmHome}>Oui</button>
                    <button onClick={handleCancelHome}>Non</button>
                </div>
            )}
        </div>
    );
};

export default Results;
