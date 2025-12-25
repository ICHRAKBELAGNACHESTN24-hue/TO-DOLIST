import React, { useState, useEffect } from 'react';
import { Check, Trash2, Plus, AlertCircle, Loader2, Edit2, X, Save } from 'lucide-react';

const API_URL = 'http://127.0.0.1:8000/api';

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // États pour l'édition
  const [editingTask, setEditingTask] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  // Fonction de validation du titre
  const validateTitle = (title) => {
    // Vérifier la longueur minimale
    if (title.trim().length < 5) {
      return 'Le titre doit contenir au moins 5 caractères';
    }

    // Vérifier qu'il ne contient pas de chiffres
    if (/\d/.test(title)) {
      return 'Le titre ne peut pas contenir de chiffres';
    }

    // Vérifier qu'il ne contient pas de caractères spéciaux
    if (/[!@#$%^&*()_+=\[\]{};':"\\|,.<>?]/.test(title)) {
      return 'Le titre ne peut pas contenir de caractères spéciaux (!@#$%^&* etc.)';
    }

    // Vérifier qu'il contient au moins des lettres
    if (!/[a-zA-ZÀ-ÿ]/.test(title)) {
      return 'Le titre doit contenir des lettres';
    }

    return null;
  };

  const fetchTasks = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/tasks`);
      if (!response.ok) throw new Error('Erreur lors du chargement des tâches');
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async () => {
    if (!newTask.trim()) {
      setValidationError('Le titre ne peut pas être vide');
      return;
    }

    // Validation du titre
    const validationErr = validateTitle(newTask);
    if (validationErr) {
      setValidationError(validationErr);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newTask,
          description: newDescription || '',
          completed: false
        }),
      });

      if (!response.ok) throw new Error('Erreur lors de l\'ajout');
      
      const data = await response.json();
      setTasks([...tasks, data]);
      setNewTask('');
      setNewDescription('');
      setError('');
      setValidationError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleTask = async (task) => {
    try {
      const response = await fetch(`${API_URL}/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: task.title,
          description: task.description || '',
          completed: !task.completed
        }),
      });

      if (!response.ok) throw new Error('Erreur lors de la mise à jour');
      
      const updatedTask = await response.json();
      setTasks(tasks.map(t => t.id === task.id ? updatedTask : t));
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteTask = async (id) => {
    try {
      const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Erreur lors de la suppression');
      
      setTasks(tasks.filter(t => t.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  // Fonction pour démarrer l'édition
  const startEdit = (task) => {
    setEditingTask(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
  };

  // Fonction pour annuler l'édition
  const cancelEdit = () => {
    setEditingTask(null);
    setEditTitle('');
    setEditDescription('');
    setValidationError('');
  };

  // Fonction pour sauvegarder la modification
  const saveEdit = async (taskId) => {
    if (!editTitle.trim()) {
      setValidationError('Le titre ne peut pas être vide');
      return;
    }

    // Validation du titre
    const validationErr = validateTitle(editTitle);
    if (validationErr) {
      setValidationError(validationErr);
      return;
    }

    try {
      const task = tasks.find(t => t.id === taskId);
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
          completed: task.completed
        }),
      });

      if (!response.ok) throw new Error('Erreur lors de la mise à jour');
      
      const updatedTask = await response.json();
      setTasks(tasks.map(t => t.id === taskId ? updatedTask : t));
      cancelEdit();
      setError('');
      setValidationError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addTask();
    }
  };

  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #ffffffff 0%, #ffffffff 100%)',
      padding: '40px 20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #f0e68fff 0%, #e59215ff 100%)',
          padding: '30px',
          color: 'white',
          textAlign: 'center'
        }}>
          <h1 style={{ margin: '0 0 10px 0', fontSize: '2em' }}> To-Do List</h1>
          <p style={{ margin: 0, opacity: 0.9 }}>{completedCount} / {tasks.length} tâches terminées</p>
        </div>

        <div style={{ padding: '30px' }}>
          {/* Formulaire d'ajout */}
          <div style={{ marginBottom: '30px' }}>
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Titre de la tâche..."
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e2e8f0',
                borderRadius: '10px',
                fontSize: '16px',
                marginBottom: '10px',
                boxSizing: 'border-box',
                outline: 'none',
                transition: 'border 0.3s'
              }}
            />
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Description (optionnelle)..."
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e2e8f0',
                borderRadius: '10px',
                fontSize: '14px',
                marginBottom: '10px',
                boxSizing: 'border-box',
                outline: 'none',
                resize: 'vertical',
                minHeight: '60px',
                fontFamily: 'inherit'
              }}
            />
            <button onClick={addTask} style={{
              width: '100%',
              padding: '12px',
              background: 'linear-gradient(135deg, #618e71ff 0%, #879e22ff 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'transform 0.2s'
            }}>
              <Plus size={20} />
              Ajouter la tâche
            </button>
          </div>

          {/* Message d'erreur */}
          {error && (
            <div style={{
              padding: '12px 16px',
              background: '#fee2e2',
              color: '#dc2626',
              borderRadius: '10px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          {/* Message de validation */}
          {validationError && (
            <div style={{
              padding: '12px 16px',
              background: '#fef3c7',
              color: '#b3c382ff',
              borderRadius: '10px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <AlertCircle size={20} />
              <span>{validationError}</span>
            </div>
          )}

          {/* Liste des tâches */}
          <div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
              </div>
            ) : tasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                <p style={{ fontSize: '18px', margin: '0 0 5px 0' }}>Aucune tâche pour le moment</p>
                <p style={{ margin: 0 }}>Ajoutez-en une ci-dessus !</p>
              </div>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {tasks.map((task) => (
                  <li key={task.id} style={{
                    background: '#f8fafc',
                    border: '2px solid #e3eaf2ff',
                    borderRadius: '12px',
                    marginBottom: '12px',
                    padding: '16px',
                    transition: 'all 0.3s'
                  }}>
                    {editingTask === task.id ? (
                      // Mode édition
                      <div>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            border: '2px solid #667eea',
                            borderRadius: '8px',
                            fontSize: '15px',
                            marginBottom: '10px',
                            boxSizing: 'border-box',
                            outline: 'none'
                          }}
                        />
                        <textarea
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          placeholder="Description..."
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            border: '2px solid #667eea',
                            borderRadius: '8px',
                            fontSize: '14px',
                            marginBottom: '10px',
                            boxSizing: 'border-box',
                            outline: 'none',
                            resize: 'vertical',
                            minHeight: '60px',
                            fontFamily: 'inherit'
                          }}
                        />
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => saveEdit(task.id)} style={{
                            flex: 1,
                            padding: '8px 16px',
                            background: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            fontSize: '14px',
                            fontWeight: '500'
                          }}>
                            <Save size={16} />
                            Enregistrer
                          </button>
                          <button onClick={cancelEdit} style={{
                            flex: 1,
                            padding: '8px 16px',
                            background: '#6b7280',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            fontSize: '14px',
                            fontWeight: '500'
                          }}>
                            <X size={16} />
                            Annuler
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Mode affichage
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <div
                          onClick={() => toggleTask(task)}
                          style={{
                            width: '24px',
                            height: '24px',
                            minWidth: '24px',
                            borderRadius: '6px',
                            border: '2px solid #cbd5e1',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            background: task.completed ? '#dae19dff' : 'white',
                            borderColor: task.completed ? '#8bc515ff' : '#cbd5e1',
                            transition: 'all 0.3s',
                            marginTop: '2px'
                          }}
                        >
                          {task.completed && <Check size={16} color="white" />}
                        </div>

                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontSize: '16px',
                            color: task.completed ? '#565753ff' : '#1e293b',
                            textDecoration: task.completed ? 'line-through' : 'none',
                            marginBottom: task.description ? '6px' : 0,
                            fontWeight: '500'
                          }}>
                            {task.title}
                          </div>
                          {task.description && (
                            <div style={{
                              fontSize: '14px',
                              color: '#64748b',
                              lineHeight: '1.5'
                            }}>
                              {task.description}
                            </div>
                          )}
                        </div>

                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => startEdit(task)}
                            style={{
                              padding: '8px',
                              background: '#f1f5f9',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              color: '#475569',
                              transition: 'background 0.2s'
                            }}
                            title="Modifier"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => deleteTask(task.id)}
                            style={{
                              padding: '8px',
                              background: '#fee2e2',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              color: '#dc2626',
                              transition: 'background 0.2s'
                            }}
                            title="Supprimer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div style={{
            marginTop: '30px',
            textAlign: 'center',
            color: '#94a3b8',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            TO-DO APP
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;