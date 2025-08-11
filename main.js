import './style.css'

class TodoApp {
  constructor() {
    this.todos = JSON.parse(localStorage.getItem('todos')) || [];
    this.currentFilter = 'all';
    this.isDarkTheme = localStorage.getItem('darkTheme') === 'true';
    this.fabOpen = false;
    
    this.init();
  }

  init() {
    this.bindEvents();
    this.render();
    this.updateStats();
    this.applyTheme();
    this.createBackgroundSparkles();
  }

  bindEvents() {
    // Form submission
    document.getElementById('todoForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.addTodo();
    });

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.setFilter(e.target.dataset.filter);
      });
    });

    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', () => {
      this.toggleTheme();
    });

    // Floating action menu
    document.getElementById('fabMain').addEventListener('click', () => {
      this.toggleFab();
    });

    document.getElementById('clearCompleted').addEventListener('click', () => {
      this.clearCompleted();
    });

    document.getElementById('markAllComplete').addEventListener('click', () => {
      this.markAllComplete();
    });

    document.getElementById('exportTodos').addEventListener('click', () => {
      this.exportTodos();
    });

    // Input animations
    const todoInput = document.getElementById('todoInput');
    todoInput.addEventListener('focus', () => {
      this.createSparkleEffect(todoInput);
    });
  }

  addTodo() {
    const input = document.getElementById('todoInput');
    const text = input.value.trim();
    
    if (!text) return;

    const todo = {
      id: Date.now(),
      text: text,
      completed: false,
      createdAt: new Date().toISOString()
    };

    this.todos.unshift(todo);
    input.value = '';
    
    this.saveTodos();
    this.render();
    this.updateStats();
    
    // Add creation animation
    setTimeout(() => {
      const todoElement = document.querySelector('.todo-item');
      if (todoElement) {
        this.createSparkleEffect(todoElement);
      }
    }, 100);
  }

  toggleTodo(id) {
    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      
      if (todo.completed) {
        this.createConfetti();
        this.playCompletionAnimation(id);
      }
      
      this.saveTodos();
      this.render();
      this.updateStats();
    }
  }

  deleteTodo(id) {
    const todoElement = document.querySelector(`[data-id="${id}"]`);
    if (todoElement) {
      todoElement.classList.add('removing');
      setTimeout(() => {
        this.todos = this.todos.filter(t => t.id !== id);
        this.saveTodos();
        this.render();
        this.updateStats();
      }, 300);
    }
  }

  editTodo(id, newText) {
    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      todo.text = newText;
      this.saveTodos();
      this.render();
    }
  }

  setFilter(filter) {
    this.currentFilter = filter;
    
    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    
    this.render();
  }

  toggleTheme() {
    this.isDarkTheme = !this.isDarkTheme;
    this.applyTheme();
    localStorage.setItem('darkTheme', this.isDarkTheme);
  }

  applyTheme() {
    const body = document.body;
    const themeBtn = document.getElementById('themeToggle');
    
    if (this.isDarkTheme) {
      body.classList.add('dark-theme');
      themeBtn.innerHTML = '<i class="fas fa-sun"></i><span>Light</span>';
    } else {
      body.classList.remove('dark-theme');
      themeBtn.innerHTML = '<i class="fas fa-moon"></i><span>Dark</span>';
    }
  }

  toggleFab() {
    this.fabOpen = !this.fabOpen;
    const menu = document.querySelector('.floating-menu');
    menu.classList.toggle('active', this.fabOpen);
    
    const mainBtn = document.getElementById('fabMain');
    mainBtn.style.transform = this.fabOpen 
      ? 'scale(1.1) rotate(45deg)' 
      : 'scale(1) rotate(0deg)';
  }

  clearCompleted() {
    this.todos = this.todos.filter(t => !t.completed);
    this.saveTodos();
    this.render();
    this.updateStats();
    this.toggleFab();
  }

  markAllComplete() {
    this.todos.forEach(todo => {
      if (!todo.completed) {
        todo.completed = true;
      }
    });
    
    if (this.todos.length > 0) {
      this.createConfetti();
    }
    
    this.saveTodos();
    this.render();
    this.updateStats();
    this.toggleFab();
  }

  exportTodos() {
    const dataStr = JSON.stringify(this.todos, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `todos-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    this.toggleFab();
  }

  render() {
    const todoList = document.getElementById('todoList');
    const emptyState = document.getElementById('emptyState');
    
    let filteredTodos = [...this.todos];
    
    switch (this.currentFilter) {
      case 'pending':
        filteredTodos = this.todos.filter(t => !t.completed);
        break;
      case 'completed':
        filteredTodos = this.todos.filter(t => t.completed);
        break;
    }

    if (filteredTodos.length === 0) {
      emptyState.style.display = 'block';
      const existingTodos = todoList.querySelectorAll('.todo-item');
      existingTodos.forEach(item => item.remove());
      return;
    }

    emptyState.style.display = 'none';
    
    // Clear existing todos
    const existingTodos = todoList.querySelectorAll('.todo-item');
    existingTodos.forEach(item => item.remove());
    
    // Render todos
    filteredTodos.forEach((todo, index) => {
      const todoElement = this.createTodoElement(todo);
      todoElement.style.animationDelay = `${index * 0.1}s`;
      todoList.appendChild(todoElement);
    });
  }

  createTodoElement(todo) {
    const div = document.createElement('div');
    div.className = `todo-item ${todo.completed ? 'completed' : ''}`;
    div.dataset.id = todo.id;
    div.draggable = true;
    
    div.innerHTML = `
      <div class="todo-checkbox ${todo.completed ? 'checked' : ''}" onclick="app.toggleTodo(${todo.id})">
        <i class="fas fa-check"></i>
      </div>
      <div class="todo-text ${todo.completed ? 'completed' : ''}" onclick="app.startEdit(${todo.id})">${todo.text}</div>
      <div class="todo-actions">
        <button class="action-btn edit-btn" onclick="app.startEdit(${todo.id})" title="Edit">
          <i class="fas fa-edit"></i>
        </button>
        <button class="action-btn delete-btn" onclick="app.deleteTodo(${todo.id})" title="Delete">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;

    // Add drag and drop functionality
    this.addDragAndDrop(div);
    
    return div;
  }

  addDragAndDrop(element) {
    element.addEventListener('dragstart', (e) => {
      element.classList.add('dragging');
      e.dataTransfer.setData('text/plain', element.dataset.id);
    });

    element.addEventListener('dragend', () => {
      element.classList.remove('dragging');
    });

    element.addEventListener('dragover', (e) => {
      e.preventDefault();
    });

    element.addEventListener('drop', (e) => {
      e.preventDefault();
      const draggedId = e.dataTransfer.getData('text/plain');
      const droppedId = element.dataset.id;
      
      if (draggedId !== droppedId) {
        this.reorderTodos(draggedId, droppedId);
      }
    });
  }

  reorderTodos(draggedId, droppedId) {
    const draggedIndex = this.todos.findIndex(t => t.id == draggedId);
    const droppedIndex = this.todos.findIndex(t => t.id == droppedId);
    
    const [draggedTodo] = this.todos.splice(draggedIndex, 1);
    this.todos.splice(droppedIndex, 0, draggedTodo);
    
    this.saveTodos();
    this.render();
  }

  startEdit(id) {
    const todoElement = document.querySelector(`[data-id="${id}"] .todo-text`);
    const todo = this.todos.find(t => t.id === id);
    
    if (!todo || todo.completed) return;
    
    const input = document.createElement('input');
    input.type = 'text';
    input.value = todo.text;
    input.className = 'todo-text editing';
    
    const originalText = todoElement.textContent;
    todoElement.parentNode.replaceChild(input, todoElement);
    input.focus();
    input.select();
    
    const finishEdit = () => {
      const newText = input.value.trim();
      if (newText && newText !== originalText) {
        this.editTodo(id, newText);
      } else {
        this.render();
      }
    };
    
    input.addEventListener('blur', finishEdit);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        finishEdit();
      }
      if (e.key === 'Escape') {
        this.render();
      }
    });
  }

  updateStats() {
    const total = this.todos.length;
    const completed = this.todos.filter(t => t.completed).length;
    const pending = total - completed;
    const progress = total > 0 ? (completed / total) * 100 : 0;
    
    document.getElementById('totalTasks').textContent = total;
    document.getElementById('completedTasks').textContent = completed;
    document.getElementById('pendingTasks').textContent = pending;
    
    // Update progress bar
    const progressFill = document.getElementById('progressFill');
    const progressSparkle = document.getElementById('progressSparkle');
    const progressText = document.getElementById('progressText');
    
    progressFill.style.width = `${progress}%`;
    progressSparkle.style.right = `${100 - progress}%`;
    
    if (progress === 0) {
      progressText.textContent = "Let's start your magical journey! ✨";
    } else if (progress < 25) {
      progressText.textContent = "Great start! Keep it up! 🌟";
    } else if (progress < 50) {
      progressText.textContent = "You're making progress! 🚀";
    } else if (progress < 75) {
      progressText.textContent = "Halfway there! Amazing work! 💫";
    } else if (progress < 100) {
      progressText.textContent = "Almost done! You're incredible! 🎯";
    } else {
      progressText.textContent = "Perfect! All tasks completed! 🎉";
    }
  }

  createSparkleEffect(element) {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle-effect';
    sparkle.textContent = '✨';
    
    const rect = element.getBoundingClientRect();
    sparkle.style.left = `${rect.left + Math.random() * rect.width}px`;
    sparkle.style.top = `${rect.top + Math.random() * rect.height}px`;
    
    document.body.appendChild(sparkle);
    
    setTimeout(() => {
      sparkle.remove();
    }, 1000);
  }

  createConfetti() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
    const confettiContainer = document.getElementById('confetti');
    
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti-piece';
      confetti.style.left = `${Math.random() * 100}%`;
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDelay = `${Math.random() * 3}s`;
      confetti.style.animationDuration = `${Math.random() * 3 + 2}s`;
      
      confettiContainer.appendChild(confetti);
      
      setTimeout(() => {
        confetti.remove();
      }, 5000);
    }
  }

  playCompletionAnimation(id) {
    const todoElement = document.querySelector(`[data-id="${id}"]`);
    if (todoElement) {
      todoElement.style.transform = 'scale(1.05)';
      this.createSparkleEffect(todoElement);
      
      setTimeout(() => {
        todoElement.style.transform = 'scale(1)';
      }, 300);
    }
  }

  createBackgroundSparkles() {
    const sparkleContainer = document.querySelector('.sparkles');
    
    setInterval(() => {
      if (Math.random() > 0.7) {
        const sparkle = document.createElement('div');
        sparkle.textContent = '✨';
        sparkle.style.position = 'absolute';
        sparkle.style.left = `${Math.random() * 100}%`;
        sparkle.style.top = `${Math.random() * 100}%`;
        sparkle.style.fontSize = `${Math.random() * 20 + 10}px`;
        sparkle.style.animation = 'sparkle 3s ease-in-out forwards';
        
        sparkleContainer.appendChild(sparkle);
        
        setTimeout(() => {
          sparkle.remove();
        }, 3000);
      }
    }, 2000);
  }

  saveTodos() {
    localStorage.setItem('todos', JSON.stringify(this.todos));
  }
}

// Initialize the app
window.app = new TodoApp();

// Add some demo todos if none exist
if (window.app.todos.length === 0) {
  const demoTodos = [
    { id: 1, text: "Welcome to your magical todo app! ✨", completed: false, createdAt: new Date().toISOString() },
    { id: 2, text: "Try completing this task", completed: false, createdAt: new Date().toISOString() },
    { id: 3, text: "Edit tasks by clicking on them", completed: false, createdAt: new Date().toISOString() },
    { id: 4, text: "Drag and drop to reorder", completed: false, createdAt: new Date().toISOString() }
  ];
  
  window.app.todos = demoTodos;
  window.app.saveTodos();
  window.app.render();
  window.app.updateStats();
}