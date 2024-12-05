/**import React, { useState } from 'react';

export const ClozeQuestionEditor = ({ question, updateOptions }) => {
    const [sentence, setSentence] = useState(question.options.sentence || '');
    const [blanks, setBlanks] = useState(question.options.blanks || []);
    const [selectedWords, setSelectedWords] = useState([]);

    const handleTextSelection = () => {
        const selection = window.getSelection();
        const text = selection.toString().trim();

        if (text) {
            // Create a new blank
            const newBlanks = [...blanks, text];
            setBlanks(newBlanks);
            setSelectedWords([...selectedWords, text]);

            // Replace the selected text with underscores in the sentence
            const range = selection.getRangeAt(0);
            const span = document.createElement('span');
            span.className = 'bg-yellow-200';
            span.textContent = '_'.repeat(text.length);
            range.deleteContents();
            range.insertNode(span);

            // Clear the selection
            selection.removeAllRanges();

            // Update the sentence with blanks
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = document.getElementById('cloze-editor').innerHTML;
            const newSentence = tempDiv.textContent;

            // Update the state and parent component
            setSentence(newSentence);
            updateOptions({
                sentence: newSentence,
                blanks: newBlanks,
                selectedWords: [...selectedWords, text]
            });
        }
    };

    const resetSelection = () => {
        setBlanks([]);
        setSelectedWords([]);
        setSentence(question.options.sentence || '');
        updateOptions({
            sentence: question.options.sentence || '',
            blanks: [],
            selectedWords: []
        });

        // Reset the editor content
        const editor = document.getElementById('cloze-editor');
        if (editor) {
            editor.innerHTML = question.options.sentence || '';
        }
    };

    return (
        <div>
            <div className="mb-2 flex justify-end">
                <button
                    onClick={resetSelection}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                >
                    Reset
                </button>
            </div>
            <div
                id="cloze-editor"
                className="w-full p-4 mb-2 border rounded min-h-[100px] bg-white"
                contentEditable
                suppressContentEditableWarning
                onMouseUp={handleTextSelection}
                dangerouslySetInnerHTML={{ __html: sentence }}
            />
            <div className="mt-4">
                <h3 className="font-bold">Selected Words:</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                    {selectedWords.map((word, index) => (
                        <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 rounded-full text-sm"
                        >
                            {word}
                        </span>
                    ))}
                </div>
            </div>
            <div className="mt-4">
                <p className="text-sm text-gray-600">
                    Select text to create blanks. Selected words will be replaced with underscores.
                </p>
            </div>
        </div>
    );
};

export const ClozeQuestionRenderer = ({ question, answer, onChange }) => {
    const parts = question.options.sentence.split(/(_+)/g);

    return (
        <div className="p-4">
            {parts.map((part, index) => {
                if (part.startsWith('_')) {
                    const blankIndex = Math.floor(index / 2);
                    const correctWord = question.options.selectedWords[blankIndex];
                    return (
                        <input
                            key={index}
                            type="text"
                            value={answer[blankIndex] || ''}
                            onChange={(e) => {
                                const newAnswer = [...answer];
                                newAnswer[blankIndex] = e.target.value;
                                onChange(newAnswer);
                            }}
                            className="w-24 p-1 mx-1 border-b-2 border-gray-300 focus:outline-none focus:border-blue-500"
                            placeholder={`(${correctWord.length} letters)`}
                        />
                    );
                }
                return <span key={index}>{part}</span>;
            })}
        </div>
    );
};
*/


import React, { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const ItemTypes = {
    WORD: 'word'
};

const DraggableWord = ({ word, index }) => {
    const [{ isDragging }, drag] = useDrag({
        type: ItemTypes.WORD,
        item: { word, index },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    return (
        <div
            ref={drag}
            className={`inline-block p-2 m-1 bg-blue-100 border border-blue-300 rounded cursor-move ${isDragging ? 'opacity-50' : ''
                }`}
        >
            {word}
        </div>
    );
};

const BlankSpace = ({ index, word, onDrop }) => {
    const [{ isOver }, drop] = useDrop({
        accept: ItemTypes.WORD,
        drop: (item) => onDrop(item.word, index),
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    });

    return (
        <span
            ref={drop}
            className={`inline-block w-24 p-1 mx-1 border-b-2 ${isOver ? 'border-blue-500' : 'border-gray-300'
                }`}
        >
            {word || ''}
        </span>
    );
};

export const ClozeQuestionEditor = ({ question, updateOptions }) => {
    const [sentence, setSentence] = useState(question.options.sentence || '');
    const [blanks, setBlanks] = useState(question.options.blanks || []);

    useEffect(() => {
        updateOptions({ sentence, blanks });
    }, [sentence, blanks, updateOptions]);

    const handleSentenceChange = (e) => {
        const newSentence = e.target.value;
        setSentence(newSentence);
        const newBlanks = newSentence.match(/\{(.+?)\}/g) || [];
        setBlanks(newBlanks.map(blank => blank.slice(1, -1)));
    };

    return (
        <div>
            <div className="mb-4">
                <label className="block mb-2 font-bold">Sentence (use {'{'}{'}'} for blanks):</label>
                <textarea
                    value={sentence}
                    onChange={handleSentenceChange}
                    className="w-full p-2 border rounded"
                    rows={4}
                    placeholder="The {cat} sat on the {mat}."
                />
            </div>
            <div className="mb-4">
                <h3 className="font-bold">Blanks:</h3>
                <ul className="list-disc pl-5">
                    {blanks.map((blank, index) => (
                        <li key={index}>{blank}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export const ClozeQuestionRenderer = ({ question, answer, onChange }) => {
    const [currentAnswer, setCurrentAnswer] = useState(answer || {});

    useEffect(() => {
        onChange(currentAnswer);
    }, [currentAnswer, onChange]);

    const handleDrop = (word, index) => {
        setCurrentAnswer(prev => ({
            ...prev,
            [index]: word
        }));
    };

    const renderSentence = () => {
        const parts = question.options.sentence.split(/\{(.+?)\}/g);
        return parts.map((part, index) => {
            if (index % 2 === 0) {
                return <span key={index}>{part}</span>;
            } else {
                return (
                    <BlankSpace
                        key={index}
                        index={index}
                        word={currentAnswer[index]}
                        onDrop={handleDrop}
                    />
                );
            }
        });
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="mb-4">
                {renderSentence()}
            </div>
            <div className="flex flex-wrap">
                {question.options.blanks.map((word, index) => (
                    <DraggableWord key={index} word={word} index={index} />
                ))}
            </div>
        </DndProvider>
    );
};

