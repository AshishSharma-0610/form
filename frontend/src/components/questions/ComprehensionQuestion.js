import React, { useState } from 'react';

export const ComprehensionQuestionEditor = ({ question, updateOptions }) => {
    const [newMcqQuestion, setNewMcqQuestion] = useState('');
    const [newOptions, setNewOptions] = useState(['', '', '', '']);
    const [correctOption, setCorrectOption] = useState(0);

    const handlePassageChange = (e) => {
        updateOptions({ ...question.options, passage: e.target.value });
    };

    const addMcqQuestion = () => {
        if (newMcqQuestion && newOptions.every(option => option !== '')) {
            const updatedMcqQuestions = [
                ...(question.options.mcqQuestions || []),
                {
                    question: newMcqQuestion,
                    options: newOptions,
                    correctOption: correctOption
                }
            ];
            updateOptions({ ...question.options, mcqQuestions: updatedMcqQuestions });
            setNewMcqQuestion('');
            setNewOptions(['', '', '', '']);
            setCorrectOption(0);
        }
    };

    return (
        <div>
            <textarea
                placeholder="Enter passage"
                value={question.options.passage || ''}
                onChange={handlePassageChange}
                className="w-full p-2 mb-2 border rounded"
                rows={6}
            />
            <div className="mb-2">
                <input
                    type="text"
                    placeholder="New MCQ Question"
                    value={newMcqQuestion}
                    onChange={(e) => setNewMcqQuestion(e.target.value)}
                    className="w-full p-2 mb-2 border rounded"
                />
                {newOptions.map((option, index) => (
                    <div key={index} className="flex mb-2">
                        <input
                            type="text"
                            placeholder={`Option ${index + 1}`}
                            value={option}
                            onChange={(e) => {
                                const updatedOptions = [...newOptions];
                                updatedOptions[index] = e.target.value;
                                setNewOptions(updatedOptions);
                            }}
                            className="flex-grow p-2 border rounded mr-2"
                        />
                        <input
                            type="radio"
                            name="correctOption"
                            checked={correctOption === index}
                            onChange={() => setCorrectOption(index)}
                            className="mt-3"
                        />
                    </div>
                ))}
                <button onClick={addMcqQuestion} className="bg-yellow-500 text-white px-2 py-1 rounded">Add MCQ Question</button>
            </div>
            <div>
                <h3 className="font-bold mt-2">MCQ Questions:</h3>
                <ul>
                    {question.options.mcqQuestions && question.options.mcqQuestions.map((mcq, index) => (
                        <li key={index}>
                            <p>{mcq.question}</p>
                            <ul>
                                {mcq.options.map((option, optionIndex) => (
                                    <li key={optionIndex}>
                                        {option} {mcq.correctOption === optionIndex ? '(Correct)' : ''}
                                    </li>
                                ))}
                            </ul>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export const ComprehensionQuestionRenderer = ({ question, answer, onChange }) => {
    return (
        <div>
            <p className="mb-4">{question.options.passage}</p>
            {question.options.mcqQuestions.map((mcq, index) => (
                <div key={index} className="mb-4">
                    <p className="font-bold">{mcq.question}</p>
                    {mcq.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center">
                            <input
                                type="radio"
                                id={`q${index}-o${optionIndex}`}
                                name={`q${index}`}
                                value={optionIndex}
                                checked={answer[index] === optionIndex.toString()}
                                onChange={() => {
                                    const newAnswer = [...answer];
                                    newAnswer[index] = optionIndex.toString();
                                    onChange(newAnswer);
                                }}
                                className="mr-2"
                            />
                            <label htmlFor={`q${index}-o${optionIndex}`}>{option}</label>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};