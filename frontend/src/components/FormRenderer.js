import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const FormRenderer = () => {
  const [form, setForm] = useState(null);
  const [answers, setAnswers] = useState({});
  const { id } = useParams();

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/forms/${id}`);
        setForm(response.data);
        initializeAnswers(response.data.questions);
      } catch (error) {
        console.error('Error fetching form:', error);
      }
    };

    fetchForm();
  }, [id]);

  const initializeAnswers = (questions) => {
    const initialAnswers = {};
    questions.forEach((question, index) => {
      if (question.type === 'Categorize') {
        initialAnswers[index] = {};
      } else if (question.type === 'Cloze') {
        initialAnswers[index] = Array(question.options.blanks.length).fill('');
      } else if (question.type === 'Comprehension') {
        initialAnswers[index] = Array(question.options.mcqQuestions.length).fill('');
      }
    });
    setAnswers(initialAnswers);
  };

  const handleAnswerChange = (questionIndex, value) => {
    setAnswers(prevAnswers => ({
      ...prevAnswers,
      [questionIndex]: value
    }));
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const questionIndex = parseInt(result.type.split('-')[1]);
    const newAnswers = { ...answers };
    const [reorderedItem] = newAnswers[questionIndex].splice(source.index, 1);
    newAnswers[questionIndex].splice(destination.index, 0, reorderedItem);

    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    try {
      await axios.post(`http://localhost:3000/api/forms/${id}/submit`, { answers });
      alert('Form submitted successfully!');
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error submitting form. Please try again.');
    }
  };

  if (!form) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{form.title}</h1>
      {form.headerImage && <img src={form.headerImage} alt="Form header" className="mb-4 max-w-full h-auto" />}
      {form.questions.map((question, index) => (
        <div key={index} className="mb-4 p-4 border rounded">
          <h2 className="text-xl font-bold mb-2">{question.question}</h2>
          {question.image && <img src={question.image} alt={`Question ${index + 1}`} className="mb-2 max-w-full h-auto" />}
          {question.type === 'Categorize' && (
            <CategorizeQuestion
              question={question}
              answer={answers[index]}
              onChange={(value) => handleAnswerChange(index, value)}
            />
          )}
          {question.type === 'Cloze' && (
            <ClozeQuestion
              question={question}
              answer={answers[index]}
              onChange={(value) => handleAnswerChange(index, value)}
            />
          )}
          {question.type === 'Comprehension' && (
            <ComprehensionQuestion
              question={question}
              answer={answers[index]}
              onChange={(value) => handleAnswerChange(index, value)}
            />
          )}
        </div>
      ))}
      <button onClick={handleSubmit} className="bg-green-500 text-white px-4 py-2 rounded">Submit</button>
    </div>
  );
};

const CategorizeQuestion = ({ question, answer, onChange }) => {
  const [items, setItems] = useState(question.options.items);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const newItems = Array.from(items);
    const [reorderedItem] = newItems.splice(source.index, 1);
    newItems.splice(destination.index, 0, reorderedItem);

    setItems(newItems);
    const newAnswer = {};
    newItems.forEach((item, index) => {
      newAnswer[item.text] = question.options.categories[Math.floor(index / (items.length / question.options.categories.length))];
    });
    onChange(newAnswer);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex">
        {question.options.categories.map((category, categoryIndex) => (
          <Droppable key={categoryIndex} droppableId={`category-${categoryIndex}`}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="flex-1 p-2 border rounded mr-2"
              >
                <h3 className="font-bold mb-2">{category}</h3>
                {items
                  .filter((item, index) => Math.floor(index / (items.length / question.options.categories.length)) === categoryIndex)
                  .map((item, index) => (
                    <Draggable key={item.text} draggableId={item.text} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="p-2 mb-2 bg-white border rounded"
                        >
                          {item.text}
                        </div>
                      )}
                    </Draggable>
                  ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
};

const ClozeQuestion = ({ question, answer, onChange }) => {
  const parts = question.options.sentence.split(/(_+)/g);

  return (
    <div>
      {parts.map((part, index) => {
        if (part.startsWith('_')) {
          const blankIndex = Math.floor(index / 2);
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
            />
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </div>
  );
};

const ComprehensionQuestion = ({ question, answer, onChange }) => {
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

export default FormRenderer;

