import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { CategorizeQuestionRenderer } from './questions/CategorizeQuestion';
import { ClozeQuestionRenderer } from './questions/ClozeQuestion';
import { ComprehensionQuestionRenderer } from './questions/ComprehensionQuestion';

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
            <CategorizeQuestionRenderer
              question={question}
              answer={answers[index]}
              onChange={(value) => handleAnswerChange(index, value)}
            />
          )}
          {question.type === 'Cloze' && (
            <ClozeQuestionRenderer
              question={question}
              answer={answers[index]}
              onChange={(value) => handleAnswerChange(index, value)}
            />
          )}
          {question.type === 'Comprehension' && (
            <ComprehensionQuestionRenderer
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

export default FormRenderer;

