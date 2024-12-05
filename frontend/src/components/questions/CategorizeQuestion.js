/**import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

export const CategorizeQuestionEditor = ({ question, updateOptions }) => {
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

export const CategorizeQuestionRenderer = ({ question, answer, onChange }) => {
    const [categories, setCategories] = useState(
        question.options.categories.map(category => ({
            id: category,
            items: []
        }))
    );

    useEffect(() => {
        const itemsPerCategory = Math.ceil(question.options.items.length / question.options.categories.length);
        const initialCategories = question.options.categories.map((category, index) => ({
            id: category,
            items: question.options.items.slice(
                index * itemsPerCategory,
                (index + 1) * itemsPerCategory
            )
        }));
        setCategories(initialCategories);
    }, [question.options.categories, question.options.items]);

    const handleDragEnd = (result) => {
        if (!result.destination) return;

        const { source, destination } = result;
        const sourceCategory = categories.find(cat => cat.id === source.droppableId);
        const destCategory = categories.find(cat => cat.id === destination.droppableId);

        if (sourceCategory && destCategory) {
            const [movedItem] = sourceCategory.items.splice(source.index, 1);
            destCategory.items.splice(destination.index, 0, movedItem);

            setCategories([...categories]);

            const newAnswer = {};
            categories.forEach(category => {
                category.items.forEach(item => {
                    newAnswer[item] = category.id;
                });
            });
            onChange(newAnswer);
        }
    };

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                    <Droppable key={category.id} droppableId={category.id}>
                        {(provided, snapshot) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className={`p-4 rounded-lg border-2 ${snapshot.isDraggingOver ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-200'
                                    }`}
                            >
                                <h3 className="font-bold mb-4 text-center">{category.id}</h3>
                                {category.items.map((item, index) => (
                                    <Draggable key={item} draggableId={item} index={index}>
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                className={`p-3 mb-2 rounded ${snapshot.isDragging ? 'bg-blue-100' : 'bg-white'
                                                    } shadow-sm border border-gray-200`}
                                            >
                                                {item}
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
*/


import React, { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const ItemTypes = {
    ITEM: 'item'
};

const DraggableItem = ({ item, index, moveItem }) => {
    const [{ isDragging }, drag] = useDrag({
        type: ItemTypes.ITEM,
        item: { index },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    return (
        <div
            ref={drag}
            className={`p-2 mb-2 bg-white border rounded cursor-move ${isDragging ? 'opacity-50' : ''
                }`}
        >
            {item}
        </div>
    );
};

const CategoryContainer = ({ category, items, moveItem }) => {
    const [, drop] = useDrop({
        accept: ItemTypes.ITEM,
        drop: (item) => moveItem(item.index, category),
    });

    return (
        <div
            ref={drop}
            className="p-4 bg-gray-100 border-2 border-gray-300 rounded-lg"
        >
            <h3 className="font-bold mb-2">{category}</h3>
            {items.map((item, index) => (
                <DraggableItem key={item} item={item} index={index} moveItem={moveItem} />
            ))}
        </div>
    );
};

export const CategorizeQuestionEditor = ({ question, updateOptions }) => {
    const [categories, setCategories] = useState(question.options.categories || []);
    const [items, setItems] = useState(question.options.items || []);
    const [newCategory, setNewCategory] = useState('');
    const [newItem, setNewItem] = useState('');

    useEffect(() => {
        updateOptions({ categories, items });
    }, [categories, items, updateOptions]);

    const addCategory = () => {
        if (newCategory.trim() !== '') {
            setCategories([...categories, newCategory.trim()]);
            setNewCategory('');
        }
    };

    const addItem = () => {
        if (newItem.trim() !== '') {
            setItems([...items, newItem.trim()]);
            setNewItem('');
        }
    };

    const removeCategory = (index) => {
        const newCategories = categories.filter((_, i) => i !== index);
        setCategories(newCategories);
    };

    const removeItem = (index) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
    };

    return (
        <div>
            <div className="mb-4">
                <h3 className="font-bold">Categories:</h3>
                <div className="flex items-center mb-2">
                    <input
                        type="text"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="flex-grow p-2 border rounded mr-2"
                        placeholder="New category"
                    />
                    <button onClick={addCategory} className="bg-blue-500 text-white px-4 py-2 rounded">
                        Add
                    </button>
                </div>
                <ul className="space-y-2">
                    {categories.map((category, index) => (
                        <li key={index} className="flex items-center justify-between p-2 bg-gray-100 rounded">
                            <span>{category}</span>
                            <button onClick={() => removeCategory(index)} className="text-red-500">
                                Remove
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="mb-4">
                <h3 className="font-bold">Items:</h3>
                <div className="flex items-center mb-2">
                    <input
                        type="text"
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        className="flex-grow p-2 border rounded mr-2"
                        placeholder="New item"
                    />
                    <button onClick={addItem} className="bg-green-500 text-white px-4 py-2 rounded">
                        Add
                    </button>
                </div>
                <ul className="space-y-2">
                    {items.map((item, index) => (
                        <li key={index} className="flex items-center justify-between p-2 bg-gray-100 rounded">
                            <span>{item}</span>
                            <button onClick={() => removeItem(index)} className="text-red-500">
                                Remove
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export const CategorizeQuestionRenderer = ({ question, answer, onChange }) => {
    const [categorizedItems, setCategorizedItems] = useState(() => {
        const initialState = {};
        question.options.categories.forEach(category => {
            initialState[category] = [];
        });
        initialState['uncategorized'] = [...question.options.items];
        return initialState;
    });

    useEffect(() => {
        const newAnswer = {};
        Object.entries(categorizedItems).forEach(([category, items]) => {
            items.forEach(item => {
                if (category !== 'uncategorized') {
                    newAnswer[item] = category;
                }
            });
        });
        onChange(newAnswer);
    }, [categorizedItems, onChange]);

    const moveItem = (itemIndex, targetCategory) => {
        setCategorizedItems(prev => {
            const newState = { ...prev };
            const sourceCategory = Object.keys(newState).find(category =>
                newState[category].includes(question.options.items[itemIndex])
            );
            const item = newState[sourceCategory].splice(newState[sourceCategory].indexOf(question.options.items[itemIndex]), 1)[0];
            newState[targetCategory].push(item);
            return newState;
        });
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CategoryContainer
                    category="Items"
                    items={categorizedItems['uncategorized']}
                    moveItem={moveItem}
                />
                {question.options.categories.map(category => (
                    <CategoryContainer
                        key={category}
                        category={category}
                        items={categorizedItems[category]}
                        moveItem={moveItem}
                    />
                ))}
            </div>
        </DndProvider>
    );
};


