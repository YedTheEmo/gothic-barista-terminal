'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface Recipe {
  name: string;
  ingredients: string[];
  steps: string[];
  machine: string;
  time: number;
  ascii: string;
  question: BrewingQuestion;
}

interface BrewingQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  hint: string;
}

const RECIPES: Recipe[] = [
  {
    name: 'AMERICANO',
    ingredients: ['FRESH COFFEE BEANS', 'HOT WATER', 'ESPRESSO MACHINE'],
    steps: [
      'GRIND COFFEE BEANS TO FINE CONSISTENCY',
      'TAMP GROUNDS INTO PORTAFILTER',
      'EXTRACT 30ML ESPRESSO SHOT',
      'ADD 120ML HOT WATER TO DILUTE',
      'SERVE IMMEDIATELY'
    ],
    machine: 'ESPRESSO MACHINE',
    time: 60,
    ascii: `
    ╔══════════════════════════════════════╗
    ║           ☕ AMERICANO ☕              ║
    ║                                      ║
    ║    ████████████████████████████████    ║
    ║    ████████████████████████████████    ║
    ║    ████████████████████████████████    ║
    ║    ████████████████████████████████    ║
    ║    ████████████████████████████████    ║
    ║    ████████████████████████████████    ║
    ╚══════════════════════════════════════╝`,
    question: {
      question: 'How many ml of hot water should you add to dilute the espresso?',
      options: ['90ml', '120ml', '150ml', '180ml'],
      correctAnswer: '120ml',
      hint: 'Check step 4 in the recipe: ADD 120ML HOT WATER TO DILUTE'
    }
  },
  {
    name: 'HOT CHOCOLATE',
    ingredients: ['COCOA POWDER', 'MILK', 'SUGAR', 'WHISK'],
    steps: [
      'HEAT MILK TO 70°C IN SAUCEPAN',
      'MIX COCOA POWDER WITH SUGAR',
      'ADD HOT MILK TO COCOA MIXTURE',
      'WHISK UNTIL SMOOTH AND FROTHY',
      'SERVE WITH MARSHMALLOWS'
    ],
    machine: 'STOVETOP',
    time: 60,
    ascii: `
    ╔══════════════════════════════════════╗
    ║         🍫 HOT CHOCOLATE 🍫          ║
    ║                                      ║
    ║    ████████████████████████████████    ║
    ║    ████████████████████████████████    ║
    ║    ████████████████████████████████    ║
    ║    ████████████████████████████████    ║
    ║    ████████████████████████████████    ║
    ║    ████████████████████████████████    ║
    ╚══════════════════════════════════════╝`,
    question: {
      question: 'What temperature should you heat the milk to?',
      options: ['60°C', '70°C', '80°C', '90°C'],
      correctAnswer: '70°C',
      hint: 'Check step 1 in the recipe: HEAT MILK TO 70°C IN SAUCEPAN'
    }
  }
];

const COMMANDS = {
  help: 'Type "help" to see available commands',
  list: 'Type "list" to see all recipes',
  view: 'Type "view [recipe]" to see recipe details',
  make: 'Type "make [recipe]" to start brewing',
  status: 'Type "status" to check brewing progress',
  clear: 'Type "clear" to clear terminal'
};

const COMMAND_SUGGESTIONS = {
  '': ['help', 'list', 'view', 'make', 'status', 'clear'],
  'view': ['americano', 'hot chocolate'],
  'make': ['americano', 'hot chocolate'],
  'v': ['view'],
  'm': ['make'],
  'h': ['help'],
  'l': ['list'],
  's': ['status'],
  'c': ['clear']
};

export default function Game() {
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [isBrewing, setBrewing] = useState(false);
  const [brewingRecipe, setBrewingRecipe] = useState<Recipe | null>(null);
  const [brewingProgress, setBrewingProgress] = useState(0);
  const [completedDrinks, setCompletedDrinks] = useState<string[]>([]);
  const [showWelcome, setShowWelcome] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState<BrewingQuestion | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [questionAsked, setQuestionAsked] = useState(false);
  const questionAskedRef = useRef(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const brewingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [musicPlaying, setMusicPlaying] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (completedDrinks.length === 2) {
      setTimeout(() => {
        router.push('/happy-birthday');
      }, 3000);
    }
  }, [completedDrinks, router]);

  useEffect(() => {
    if (showWelcome) {
      const welcomeMessages = [
        '╔══════════════════════════════════════════════════════════════╗',
        '║                    GOTHIC BARISTA TERMINAL                   ║',
        '║                                                              ║',
        '║  Welcome to the Cyberpunk Coffee Station!                   ║',
        '║  Type "help" to see available commands.                     ║',
        '║  Type "list" to view available recipes.                     ║',
        '║  Type "view [recipe]" to see recipe details.                ║',
        '║  Type "make [recipe]" to start brewing.                     ║',
        '║                                                              ║',
        '║  🎯 TIP: Commands are case-insensitive!                     ║',
        '║  🎯 TIP: Use TAB to auto-complete recipe names!             ║',
        '║  🎯 TIP: During brewing, you\'ll need to answer one question! ║',
        '╚══════════════════════════════════════════════════════════════╝'
      ];
      setTerminalOutput(welcomeMessages);
      setShowWelcome(false);
    }
  }, [showWelcome]);

  useEffect(() => {
    // Auto-scroll to bottom
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalOutput]);

  useEffect(() => {
    // Update suggestions based on current command
    const cmd = currentCommand.toLowerCase().trim();
    const parts = cmd.split(' ');
    const firstWord = parts[0];
    
    let newSuggestions: string[] = [];
    if (firstWord in COMMAND_SUGGESTIONS) {
      newSuggestions = COMMAND_SUGGESTIONS[firstWord as keyof typeof COMMAND_SUGGESTIONS];
    } else if (firstWord.startsWith('v')) {
      newSuggestions = ['view'];
    } else if (firstWord.startsWith('m')) {
      newSuggestions = ['make'];
    } else if (firstWord.startsWith('h')) {
      newSuggestions = ['help'];
    } else if (firstWord.startsWith('l')) {
      newSuggestions = ['list'];
    } else if (firstWord.startsWith('s')) {
      newSuggestions = ['status'];
    } else if (firstWord.startsWith('c')) {
      newSuggestions = ['clear'];
    }
    
    setSuggestions(newSuggestions);
  }, [currentCommand]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = true;
      if (musicPlaying) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      } else {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  }, [musicPlaying]);

  const addToTerminal = (message: string) => {
    setTerminalOutput(prev => [...prev, message]);
  };

  const askQuestion = (question: BrewingQuestion) => {
    if (brewingIntervalRef.current) {
      clearInterval(brewingIntervalRef.current);
      brewingIntervalRef.current = null;
    }
    setIsPaused(true);
    setCurrentQuestion(question);
    setQuestionAsked(true);
    questionAskedRef.current = true;
    addToTerminal(`\n❓ QUESTION: ${question.question}`);
    addToTerminal('💡 HINT: ' + question.hint);
    addToTerminal('📝 OPTIONS:');
    question.options.forEach((option, i) => {
      addToTerminal(`  ${i + 1}. ${option}`);
    });
    addToTerminal('💬 Type your answer (1, 2, 3, or 4):');
  };

  const handleAnswer = (answer: string) => {
    if (!currentQuestion) return;

    const answerIndex = parseInt(answer) - 1;
    const selectedOption = currentQuestion.options[answerIndex];
    
    if (selectedOption === currentQuestion.correctAnswer) {
      addToTerminal(`✅ CORRECT! ${selectedOption} is the right answer.`);
      addToTerminal('🚀 Continuing brewing process...');
      setCurrentQuestion(null);
      setIsPaused(false);
      
      // Restart the brewing interval
      if (brewingRecipe) {
        brewingIntervalRef.current = setInterval(() => {
          setBrewingProgress(prev => {
            const newProgress = prev + 1;
            if (newProgress >= brewingRecipe.time) {
              if (brewingIntervalRef.current) {
                clearInterval(brewingIntervalRef.current);
                brewingIntervalRef.current = null;
              }
              completeBrewing(brewingRecipe);
              return brewingRecipe.time;
            }
            return newProgress;
          });
        }, 1000);
      }
    } else {
      addToTerminal(`❌ WRONG! You selected ${selectedOption}`);
      addToTerminal(`💡 The correct answer was: ${currentQuestion.correctAnswer}`);
      addToTerminal('💬 Try again (1, 2, 3, or 4):');
    }
  };

  const executeCommand = (command: string) => {
    const cmd = command.toLowerCase().trim();
    const parts = cmd.split(' ');
    const action = parts[0];
    const target = parts[1];

    addToTerminal(`> ${command}`);

    switch (action) {
      case 'help':
        addToTerminal('Available Commands:');
        Object.entries(COMMANDS).forEach(([cmd, desc]) => {
          addToTerminal(`  ${cmd}: ${desc}`);
        });
        break;

      case 'list':
        addToTerminal('Available Recipes:');
        RECIPES.forEach(recipe => {
          addToTerminal(`  • ${recipe.name} (${recipe.time}s)`);
        });
        break;

      case 'view':
        if (!target) {
          addToTerminal('❌ ERROR: Please specify a recipe name');
          addToTerminal('💡 Try: view americano or view hot chocolate');
          break;
        }
        const recipe = RECIPES.find(r => r.name.toLowerCase().includes(target));
        if (recipe) {
          addToTerminal(`\n📖 RECIPE: ${recipe.name}`);
          addToTerminal(`⏱️  TIME: ${recipe.time} seconds`);
          addToTerminal(`🔧 MACHINE: ${recipe.machine}`);
          addToTerminal('\n📋 INGREDIENTS:');
          recipe.ingredients.forEach(ing => addToTerminal(`  • ${ing}`));
          addToTerminal('\n📝 STEPS:');
          recipe.steps.forEach((step, i) => addToTerminal(`  ${i + 1}. ${step}`));
          addToTerminal(`\n${recipe.ascii}`);
        } else {
          addToTerminal('❌ ERROR: Recipe not found');
          addToTerminal('💡 Available recipes: americano, hot chocolate');
        }
        break;

      case 'make':
        if (!target) {
          addToTerminal('❌ ERROR: Please specify a recipe name');
          addToTerminal('💡 Try: make americano or make hot chocolate');
          break;
        }
        const targetRecipe = RECIPES.find(r => r.name.toLowerCase().includes(target));
        if (targetRecipe) {
          if (completedDrinks.includes(targetRecipe.name)) {
            addToTerminal(`✅ ${targetRecipe.name} already completed!`);
            break;
          }
          if (isBrewing) {
            addToTerminal('❌ ERROR: Already brewing! Wait for current process to complete.');
            break;
          }
          startBrewing(targetRecipe);
        } else {
          addToTerminal('❌ ERROR: Recipe not found');
          addToTerminal('💡 Available recipes: americano, hot chocolate');
        }
        break;

      case 'status':
        if (isBrewing && brewingRecipe) {
          const progress = Math.round((brewingProgress / brewingRecipe.time) * 100);
          addToTerminal(`🔄 BREWING: ${brewingRecipe.name}`);
          addToTerminal(`📊 PROGRESS: ${progress}% (${brewingProgress}s/${brewingRecipe.time}s)`);
          if (isPaused) {
            addToTerminal('⏸️  PAUSED: Waiting for question answer');
          }
        } else {
          addToTerminal('💤 No active brewing process');
        }
        break;

      case 'clear':
        setTerminalOutput([]);
        break;

      default:
        if (command.trim()) {
          addToTerminal('❌ ERROR: Unknown command');
          addToTerminal('💡 Type "help" for available commands');
        }
    }
  };

  const startBrewing = (recipe: Recipe) => {
    setBrewing(true);
    setBrewingRecipe(recipe);
    setBrewingProgress(0);
    setIsPaused(false);
    setCurrentQuestion(null);
    setQuestionAsked(false);
    questionAskedRef.current = false;
    
    addToTerminal(`🚀 STARTING: ${recipe.name} brewing process`);
    addToTerminal(`⏱️  ESTIMATED TIME: ${recipe.time} seconds`);
    addToTerminal('🎯 TIP: You\'ll need to answer one question during brewing!');

    brewingIntervalRef.current = setInterval(() => {
      setBrewingProgress(prev => {
        const newProgress = prev + 1;
        // Ask question at 50% progress (30 seconds) and only once
        if (newProgress === Math.floor(recipe.time / 2) && !questionAskedRef.current) {
          askQuestion(recipe.question);
        }
        if (newProgress >= recipe.time) {
          if (brewingIntervalRef.current) {
            clearInterval(brewingIntervalRef.current);
            brewingIntervalRef.current = null;
          }
          completeBrewing(recipe);
          return recipe.time;
        }
        return newProgress;
      });
    }, 1000);
  };

  const completeBrewing = (recipe: Recipe) => {
    setBrewing(false);
    setBrewingRecipe(null);
    setBrewingProgress(0);
    setIsPaused(false);
    setCurrentQuestion(null);
    setQuestionAsked(false);
    
    if (brewingIntervalRef.current) {
      clearInterval(brewingIntervalRef.current);
      brewingIntervalRef.current = null;
    }
    
    setCompletedDrinks(prev => {
      const alreadyCompleted = prev.includes(recipe.name);
      if (alreadyCompleted) return prev;
      const newCompleted = [...prev, recipe.name];
      addToTerminal(`✅ COMPLETE: ${recipe.name} is ready!`);
      addToTerminal(`🎉 ${recipe.name} added to completed drinks`);
      addToTerminal(`📊 Progress: ${newCompleted.length}/2 drinks completed`);
      if (newCompleted.length === 2) {
        addToTerminal('🎊 ALL DRINKS COMPLETED! Transitioning to surprise...');
      }
      return newCompleted;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentCommand.trim()) {
      if (isPaused && currentQuestion) {
        handleAnswer(currentCommand);
      } else {
        executeCommand(currentCommand);
      }
      setCurrentCommand('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      if (suggestions.length > 0) {
        const cmd = currentCommand.trim();
        const parts = cmd.split(/\s+/);
        if (parts.length === 1) {
          // Single word, replace whole input
          setCurrentCommand(suggestions[0]);
        } else if (parts.length > 1) {
          // Multi-word, autocomplete the argument
          const commandWord = parts[0];
          const argFragment = parts.slice(1).join(' ');
          // Find suggestion that starts with the fragment
          const match = suggestions.find(s => s.toLowerCase().startsWith(argFragment.toLowerCase()));
          if (match) {
            setCurrentCommand(commandWord + ' ' + match);
          } else {
            setCurrentCommand(commandWord + ' ' + suggestions[0]);
          }
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-black matrix-bg flex items-center justify-center p-4">
      {/* Only render audio element when musicPlaying is true */}
      {musicPlaying && (
        <audio ref={audioRef} src="/black_white.wav" loop style={{ display: 'none' }} />
      )}
      <div className="terminal-window w-full max-w-4xl h-[80vh] flex flex-col">
        <div className="terminal-header flex items-center justify-between">
          <span className="neon-green">GOTHIC BARISTA TERMINAL v2.0</span>
          <div className="flex items-center gap-4">
            <button
              aria-label={musicPlaying ? 'Pause background music' : 'Play background music'}
              onClick={() => setMusicPlaying((p) => !p)}
              className="hover-glow text-2xl focus:outline-none"
              style={{ color: musicPlaying ? '#00ff41' : '#555' }}
            >
              {musicPlaying ? (
                <span title="Pause music">🎵</span>
              ) : (
                <span title="Play music">🔇</span>
              )}
            </button>
            <span className="neon-purple">● ● ●</span>
          </div>
        </div>
        
        <div ref={terminalRef} className="flex-1 p-4 overflow-y-auto">
          <div className="ascii-art">
            {terminalOutput.map((line, i) => (
              <div key={i} className="mb-1">
                {line}
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-4 border-t border-green-500">
          <form onSubmit={handleSubmit} className="flex items-center">
            <span className="command-prompt mr-2">barista@cyberpunk:~$</span>
            <input
              ref={inputRef}
              type="text"
              value={currentCommand}
              onChange={(e) => setCurrentCommand(e.target.value)}
              onKeyDown={handleKeyDown}
              className="command-input flex-1 bg-transparent"
              placeholder={isPaused ? "Type your answer (1-4)..." : "Type a command..."}
              disabled={isBrewing && !isPaused}
            />
            <span className="terminal-cursor ml-1">|</span>
          </form>
          
          {suggestions.length > 0 && currentCommand && !isPaused && (
            <div className="mt-2 text-sm text-gray-400">
              💡 Suggestions: {suggestions.join(', ')}
            </div>
          )}
          
          {isBrewing && brewingRecipe && (
            <div className="mt-4">
              <div className="text-sm neon-blue mb-2">
                🔄 BREWING: {brewingRecipe.name} - {Math.round((brewingProgress / brewingRecipe.time) * 100)}%
                {isPaused && ' ⏸️ PAUSED'}
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${(brewingProgress / brewingRecipe.time) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
