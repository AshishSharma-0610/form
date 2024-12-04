/**import React, { useState } from 'react';
import axios from 'axios';

const FormEditor = () => {
    const [form, setForm] = useState({
        title: '',
        headerImage: '',
        questions: []
    });

    const addQuestion = (type) => {
        setForm(prevForm => ({
            ...prevForm,
            questions: [...prevForm.questions, { type, question: '', image: '', options: {} }]
        }));
    };

    const updateQuestion = (index, field, value) => {
        setForm(prevForm => {
            const newQuestions = [...prevForm.questions];
            newQuestions[index] = { ...newQuestions[index], [field]: value };
            return { ...prevForm, questions: newQuestions };
        });
    };

    const moveQuestion = (index, direction) => {
        if (
            (direction === 'up' && index === 0) ||
            (direction === 'down' && index === form.questions.length - 1)
        ) {
            return;
        }

        const newQuestions = [...form.questions];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        [newQuestions[index], newQuestions[newIndex]] = [newQuestions[newIndex], newQuestions[index]];

        setForm(prevForm => ({ ...prevForm, questions: newQuestions }));
    };

    const saveForm = async () => {
        try {
            const response = await axios.post('http://localhost:3000/api/forms', form);
            console.log('Form saved:', response.data);
            alert('Form saved successfully!');
        } catch (error) {
            console.error('Error saving form:', error);
            alert('Error saving form. Please try again.');
        }
    };



    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Form Editor</h1>
            <input
                type="text"
                placeholder="Form Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full p-2 mb-4 border rounded"
            />
            <input
                type="text"
                placeholder="Header Image URL"
                value={form.headerImage}
                onChange={(e) => setForm({ ...form, headerImage: e.target.value })}
                className="w-full p-2 mb-4 border rounded"
            />
            <div className="mb-4">
                <button onClick={() => addQuestion('Categorize')} className="bg-blue-500 text-white px-4 py-2 rounded mr-2">Add Categorize</button>
                <button onClick={() => addQuestion('Cloze')} className="bg-green-500 text-white px-4 py-2 rounded mr-2">Add Cloze</button>
                <button onClick={() => addQuestion('Comprehension')} className="bg-yellow-500 text-white px-4 py-2 rounded">Add Comprehension</button>
            </div>
            {form.questions.map((question, index) => (
                <div key={index} className="mb-4 p-4 border rounded bg-white shadow-md">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-xl font-bold">{question.type} Question</h2>
                        <div>
                            <button
                                onClick={() => moveQuestion(index, 'up')}
                                className="bg-gray-200 text-gray-700 px-2 py-1 rounded mr-2"
                                disabled={index === 0}
                            >
                                ↑
                            </button>
                            <button
                                onClick={() => moveQuestion(index, 'down')}
                                className="bg-gray-200 text-gray-700 px-2 py-1 rounded"
                                disabled={index === form.questions.length - 1}
                            >
                                ↓
                            </button>
                        </div>
                    </div>
                    <input
                        type="text"
                        placeholder="Question"
                        value={question.question}
                        onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                        className="w-full p-2 mb-2 border rounded"
                    />
                    <input
                        type="text"
                        placeholder="Image URL"
                        value={question.image}
                        onChange={(e) => updateQuestion(index, 'image', e.target.value)}
                        className="w-full p-2 mb-2 border rounded"
                    />
                    {question.type === 'Categorize' && (
                        <CategorizeQuestionEditor
                            question={question}
                            updateOptions={(options) => updateQuestion(index, 'options', options)}
                        />
                    )}
                    {question.type === 'Cloze' && (
                        <ClozeQuestionEditor
                            question={question}
                            updateOptions={(options) => updateQuestion(index, 'options', options)}
                        />
                    )}
                    {question.type === 'Comprehension' && (
                        <ComprehensionQuestionEditor
                            question={question}
                            updateOptions={(options) => updateQuestion(index, 'options', options)}
                        />
                    )}
                </div>
            ))}
            <button onClick={saveForm} className="bg-purple-500 text-white px-4 py-2 rounded mt-4">Save Form</button>
        </div>
    );
};

const CategorizeQuestionEditor = ({ question, updateOptions }) => {
    const [newCategory, setNewCategory] = useState('');
    const [newItem, setNewItem] = useState('');

    const addCategory = () => {
        if (newCategory) {
            updateOptions({
                ...question.options,
                categories: [...(question.options.categories || []), newCategory]
            });
            setNewCategory('');
        }
    };

    const addItem = () => {
        if (newItem) {
            updateOptions({
                ...question.options,
                items: [...(question.options.items || []), newItem]
            });
            setNewItem('');
        }
    };

    return (
        <div>
            <div className="mb-2">
                <input
                    type="text"
                    placeholder="New Category"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="p-2 border rounded mr-2"
                />
                <button onClick={addCategory} className="bg-blue-500 text-white px-2 py-1 rounded">Add Category</button>
            </div>
            <div className="mb-2">
                <input
                    type="text"
                    placeholder="New Item"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    className="p-2 border rounded mr-2"
                />
                <button onClick={addItem} className="bg-green-500 text-white px-2 py-1 rounded">Add Item</button>
            </div>
            <div>
                <h3 className="font-bold mt-2">Categories:</h3>
                <ul>
                    {question.options.categories && question.options.categories.map((category, index) => (
                        <li key={index}>{category}</li>
                    ))}
                </ul>
                <h3 className="font-bold mt-2">Items:</h3>
                <ul>
                    {question.options.items && question.options.items.map((item, index) => (
                        <li key={index}>{item}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

const ClozeQuestionEditor = ({ question, updateOptions }) => {
    const handleSentenceChange = (e) => {
        const newSentence = e.target.value;
        const newBlanks = newSentence.match(/_+/g) || [];
        updateOptions({ sentence: newSentence, blanks: newBlanks });
    };

    return (
        <div>
            <textarea
                placeholder="Enter sentence with blanks (use underscores for blanks)"
                value={question.options.sentence || ''}
                onChange={handleSentenceChange}
                className="w-full p-2 mb-2 border rounded"
                rows={4}
            />
            <div>
                <h3 className="font-bold mt-2">Blanks:</h3>
                <ul>
                    {question.options.blanks && question.options.blanks.map((blank, index) => (
                        <li key={index}>Blank {index + 1}: {blank}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

const ComprehensionQuestionEditor = ({ question, updateOptions }) => {
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

export default FormEditor;

*/

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Use useNavigate instead of useHistory

const FormEditor = () => {
    const [form, setForm] = useState({
        title: '',
        headerImage: '',
        questions: []
    });
    const [formId, setFormId] = useState(null);
    const navigate = useNavigate(); // Use useNavigate for navigation

    const addQuestion = (type) => {
        setForm(prevForm => ({
            ...prevForm,
            questions: [...prevForm.questions, { type, question: '', image: '', options: {} }]
        }));
    };

    const updateQuestion = (index, field, value) => {
        setForm(prevForm => {
            const newQuestions = [...prevForm.questions];
            newQuestions[index] = { ...newQuestions[index], [field]: value };
            return { ...prevForm, questions: newQuestions };
        });
    };

    const moveQuestion = (index, direction) => {
        if (
            (direction === 'up' && index === 0) ||
            (direction === 'down' && index === form.questions.length - 1)
        ) {
            return;
        }

        const newQuestions = [...form.questions];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        [newQuestions[index], newQuestions[newIndex]] = [newQuestions[newIndex], newQuestions[index]];

        setForm(prevForm => ({ ...prevForm, questions: newQuestions }));
    };

    const saveForm = async () => {
        try {
            const response = await axios.post('http://localhost:3000/api/forms', form);
            console.log('Form saved:', response.data);
            setFormId(response.data._id);
            alert('Form saved successfully!');
        } catch (error) {
            console.error('Error saving form:', error);
            alert('Error saving form. Please try again.');
        }
    };

    const viewForm = () => {
        if (formId) {
            navigate(`/form/${formId}`);
        } else {
            alert('Please save the form first.');
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Form Editor</h1>
            <input
                type="text"
                placeholder="Form Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full p-2 mb-4 border rounded"
            />
            <input
                type="text"
                placeholder="Header Image URL"
                value={form.headerImage}
                onChange={(e) => setForm({ ...form, headerImage: e.target.value })}
                className="w-full p-2 mb-4 border rounded"
            />
            <div className="mb-4">
                <button onClick={() => addQuestion('Categorize')} className="bg-blue-500 text-white px-4 py-2 rounded mr-2">Add Categorize</button>
                <button onClick={() => addQuestion('Cloze')} className="bg-green-500 text-white px-4 py-2 rounded mr-2">Add Cloze</button>
                <button onClick={() => addQuestion('Comprehension')} className="bg-yellow-500 text-white px-4 py-2 rounded">Add Comprehension</button>
            </div>
            {form.questions.map((question, index) => (
                <div key={index} className="mb-4 p-4 border rounded bg-white shadow-md">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-xl font-bold">{question.type} Question</h2>
                        <div>
                            <button
                                onClick={() => moveQuestion(index, 'up')}
                                className="bg-gray-200 text-gray-700 px-2 py-1 rounded mr-2"
                                disabled={index === 0}
                            >
                                ↑
                            </button>
                            <button
                                onClick={() => moveQuestion(index, 'down')}
                                className="bg-gray-200 text-gray-700 px-2 py-1 rounded"
                                disabled={index === form.questions.length - 1}
                            >
                                ↓
                            </button>
                        </div>
                    </div>
                    <input
                        type="text"
                        placeholder="Question"
                        value={question.question}
                        onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                        className="w-full p-2 mb-2 border rounded"
                    />
                    <input
                        type="text"
                        placeholder="Image URL"
                        value={question.image}
                        onChange={(e) => updateQuestion(index, 'image', e.target.value)}
                        className="w-full p-2 mb-2 border rounded"
                    />
                    {question.type === 'Categorize' && (
                        <CategorizeQuestionEditor
                            question={question}
                            updateOptions={(options) => updateQuestion(index, 'options', options)}
                        />
                    )}
                    {question.type === 'Cloze' && (
                        <ClozeQuestionEditor
                            question={question}
                            updateOptions={(options) => updateQuestion(index, 'options', options)}
                        />
                    )}
                    {question.type === 'Comprehension' && (
                        <ComprehensionQuestionEditor
                            question={question}
                            updateOptions={(options) => updateQuestion(index, 'options', options)}
                        />
                    )}
                </div>
            ))}
            <div className="mt-4">
                <button onClick={saveForm} className="bg-purple-500 text-white px-4 py-2 rounded mr-2">Save Form</button>
                <button onClick={viewForm} className="bg-green-500 text-white px-4 py-2 rounded">View Form</button>
            </div>
        </div>
    );
};

const CategorizeQuestionEditor = ({ question, updateOptions }) => {
    const [newCategory, setNewCategory] = useState('');
    const [newItem, setNewItem] = useState('');

    const addCategory = () => {
        if (newCategory) {
            updateOptions({
                ...question.options,
                categories: [...(question.options.categories || []), newCategory]
            });
            setNewCategory('');
        }
    };

    const addItem = () => {
        if (newItem) {
            updateOptions({
                ...question.options,
                items: [...(question.options.items || []), newItem]
            });
            setNewItem('');
        }
    };

    return (
        <div>
            <div className="mb-2">
                <input
                    type="text"
                    placeholder="New Category"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="p-2 border rounded mr-2"
                />
                <button onClick={addCategory} className="bg-blue-500 text-white px-2 py-1 rounded">Add Category</button>
            </div>
            <div className="mb-2">
                <input
                    type="text"
                    placeholder="New Item"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    className="p-2 border rounded mr-2"
                />
                <button onClick={addItem} className="bg-green-500 text-white px-2 py-1 rounded">Add Item</button>
            </div>
            <div>
                <h3 className="font-bold mt-2">Categories:</h3>
                <ul>
                    {question.options.categories && question.options.categories.map((category, index) => (
                        <li key={index}>{category}</li>
                    ))}
                </ul>
                <h3 className="font-bold mt-2">Items:</h3>
                <ul>
                    {question.options.items && question.options.items.map((item, index) => (
                        <li key={index}>{item}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

const ClozeQuestionEditor = ({ question, updateOptions }) => {
    const handleSentenceChange = (e) => {
        const newSentence = e.target.value;
        const newBlanks = newSentence.match(/_+/g) || [];
        updateOptions({ sentence: newSentence, blanks: newBlanks });
    };

    return (
        <div>
            <textarea
                placeholder="Enter sentence with blanks (use underscores for blanks)"
                value={question.options.sentence || ''}
                onChange={handleSentenceChange}
                className="w-full p-2 mb-2 border rounded"
                rows={4}
            />
            <div>
                <h3 className="font-bold mt-2">Blanks:</h3>
                <ul>
                    {question.options.blanks && question.options.blanks.map((blank, index) => (
                        <li key={index}>Blank {index + 1}: {blank}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

const ComprehensionQuestionEditor = ({ question, updateOptions }) => {
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

export default FormEditor;
