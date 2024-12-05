/**import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import FormEditor from './components/FormEditor';
import FormPreview from './components/FormPreview';

function App() {
  return (
    <Router>
      <div className="App">
        <Switch>
          <Route exact path="/" component={FormEditor} />
          <Route path="/preview/:id" component={FormPreview} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;*/
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FormEditor from './components/FormEditor';
import FormRenderer from './components/FormRenderer';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<FormEditor />} />
          <Route path="/form/:id" element={<FormRenderer />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
