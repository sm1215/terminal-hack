// TODO:
// make a debug log where the user input is recorded and the state of the matrix is saved
// and this can be copied with a button

// Give a checkbox to remove a dud, and not count the likeness it has

// This made a previous answer that was crossed out, not crossed out anymore
// Answer: gate

// entered 1st RACE: likeness 2
// entered 2nd ONCE: likeness: 1

// ONCE
// LOCK
// SPIN
// WAYS
// GATE
// RACE
// SUNK
// WHEN
const terminal = {
    debug: false,
    // sample: ['caves', 'vents', 'pages', 'cried', 'actor', 'mines', 'dried', 'races', 'paper', 'vault', 'green', 'noted', 'helps', 'creed', 'plate', 'types', 'games', 'holes', 'pouch', 'plush'],
    // sample: ['gates', 'spans', 'hence', 'masks', 'rates', 'boost', 'midst', 'harem', 'sword', 'sells', 'young', 'males', 'knock', 'wares', 'vault', 'black', 'tires', 'prove', 'wrote', 'large'],
    
    // scant: 0, cards: 1, empty: 0, re-highlighted
    // sample: ['saaay', 'cards','empty','viral','shrug','scope','shady','blood','could','scant','weeks','lying','gains','erupt'],
    // sample: [
    //     'AABB', // 2
    //     'CCCB', // 1
    //     'AAEB', // 3
    //     'AEEB', // answer
    // ],
    // sample: ['ONCE', 'LOCK', 'SPIN', 'WAYS', 'GATE', 'RACE', 'SUNK', 'WHEN' ],
    // answer: 'gate',
    matrix: {},

    ui: {
        entry: document.querySelector('#entry'),
        reset: document.querySelector('#reset'),
        run: document.querySelector('#run'),
        likeness: document.querySelectorAll('.likeness'),
        results: document.querySelector('#results'),
        error: document.querySelector('#error')
    },

    runDebug: function() {
        this.ui.entry.value = terminal.sample.join('\n');
        const runEvent = new Event('click');
        this.ui.run.dispatchEvent(runEvent);

        console.log('terminal', terminal);
        console.log('this.matrix', this.matrix);

        // this.ui.likeness[0].value = 2;
        // const likenessEvent = new Event('input');
        // this.ui.likeness[0].dispatchEvent(likenessEvent);
    },

    // used for the static portions of the UI that don't get rebuilt
    addMainEvents: function () {
        this.ui.reset.addEventListener('click', () => {
            this.ui.entry.value = '';
            this.ui.results.innerHTML = '';
            this.ui.results.classList.remove('on');
            this.removeResultsEvents();
        });

        this.ui.run.addEventListener('click', () => {
            if (this.ui.entry.value.length <= 0) {
                return;
            }

            if (this.validateInput()) {
                this.findSimilarities();
            }
        });
    },

    // used for dynamic portions of the UI, the results table
    updateUi: function() {
        this.removeResultsEvents();
        this.showResults();
        this.ui.likeness = document.querySelectorAll('.likeness');
        this.addResultsEvents();
    },

    // bound to terminal context
    likenessEventHandler: function (event) {
        const likeness = parseInt(event.target.value, 10);

        // only allow numeric values
        if (isNaN(likeness)) {
            event.target.value = '';
        }

        const targetWordIndex = parseInt(event.target.id, 10);
        const [entry] = terminal.matrix.filter(({wordIndex}) => wordIndex === targetWordIndex);
        entry.likeness = isNaN(likeness) ? null : likeness;

        this.resetDisplay();
        this.filterMatrixBySameLikeness();
        this.filterWordWithLikeness();
        this.filterZeroLikeness();
        this.updateUi();
    },

    // The contents of the results table are dynamic and events need to be handled separately
    addResultsEvents() {
        this.ui.likeness.forEach((element) => element.addEventListener('input', this.likenessEventHandler.bind(this)));
    },

    removeResultsEvents() {
        this.ui.likeness.forEach((element) => element.removeEventListener('input', this.likenessEventHandler.bind(this)));
    },

    validateInput: function() {
        const input = this.ui.entry.value
            .split('\n')
            .filter((value) => value);

        const allWordsSameLength = input.every((value) => value.length === input[0].length);
        
        if (!allWordsSameLength) {
            this.ui.error.classList.add('on');
        } else {
            this.ui.error.classList.remove('on');
        }
        return allWordsSameLength;
    },

    initMatrix: function () {
        const data = this.ui.entry.value.split('\n').filter((value) => value);
        return data.map((word, wordIndex) => {
            return {
                wordIndex,
                word,
                display: true,
                letters: word.split('').map((letter, letterIndex) => {
                    return {
                        letterIndex,
                        letter,
                        matches: 0
                    };
                }),
                totalMatches: function() { 
                    return this.letters
                        .map(({matches}) => matches)
                        .reduce((previous, current) => { return previous += current; }, 0);
                },
                likeness: null,
                similarities: []
            };
        });
    },

    // returns a new matrix sorted by highest totalMatches in descending order
    sortData: function (data) {
        return [...data].sort((a, b) => b.totalMatches() - a.totalMatches());
    },

    // reset the display so each filtering pass can start fresh
    // useful when the user manually deletes last remaining likeness entry
    resetDisplay: function() {
        this.matrix.forEach((entry) => {
            entry.display = true
        });
    },

    // returns a new matrix with entries that match the same likeness
    filterMatrixBySameLikeness: function() {
        const data = [...this.matrix];
        
        const wordsWithLikess = data
            .filter(({likeness}) => likeness);
        
        // leaving highestLikeness filtering in place for now
        // const highestLikeness = Math.max(...data.map(({likeness}) => likeness));
        // const wordsToCompare = data
        //     .filter(({likeness}) => likeness === highestLikeness)
        //     .sort((a, b) => a.likeness - b.likeness);

        if (wordsWithLikess.length < 1) {
            return data;
        }

        // find other words that have a similar likeness
        // this won't include the word we are comparing against
        const matchingWordIndexes = wordsWithLikess
            .flatMap(({likeness, similarities}) => similarities
                .filter(({commonLetters}) => commonLetters.length === likeness)
                .map(({wordIndex}) => wordIndex)
        );
    
        const matchingWords = data
            .filter(({wordIndex}) => 
                matchingWordIndexes.includes(wordIndex)
                // don't include words we're already comparing against, it introduces duplicates
                && !wordsWithLikess.map(({wordIndex}) => wordIndex).includes(wordIndex)
            );

        const combined = [...wordsWithLikess, ...matchingWords].map(({wordIndex}) => wordIndex);

        data.forEach((entry) => {
            if (combined.includes(entry.wordIndex)) {
                entry.display = false;
            }
        });
    },

    // any word that has a likeness can't be the password
    // otherwise we wouldn't still be playing
    // this should never be a toggle, only a way to turn an entry off
    filterWordWithLikeness() {
        this.matrix.forEach((entry) => {
            if (!isNaN(parseInt(entry.likeness))) {
                entry.display = false;
            }
        });
    },

    // filter out any similarities to a word that has a 0 likeness
    // this should always run last
    filterZeroLikeness() {
        const data = this.matrix;

        const wordsWithZeroLikeness = data.filter(({likeness}) => likeness === 0);

        if (wordsWithZeroLikeness.length < 1) {
            return;
        }

        // for all the words marked with 0 likeness,
        // find all the words that share 
        // a similarity with them
        const matchingWordIndexes = wordsWithZeroLikeness.flatMap(
            ({similarities}) => similarities.map(({wordIndex}) => wordIndex)
        );

        // include the original word because it also needs to be excluded from the final results
        const combined = [
            ...wordsWithZeroLikeness.map(({wordIndex}) => wordIndex),
            ...matchingWordIndexes
        ];

        // this should only ever turn displays off
        data.forEach((entry) => {
            if (combined.includes(entry.wordIndex)) {
                entry.display = false;
            }
        });
    },

    // compares the matches of each letter to find how alike one word is to another
    // also finds general total matches
    findSimilarities: function(matrix = this.initMatrix()) {
        for (let row = 0; row < matrix.length; row++) {
            for (let column = 0; column < matrix[row].letters.length; column++) {
                const letter = matrix[row].letters[column].letter;

                for (let compareRow = 0; compareRow < matrix.length; compareRow++) {
                    if (row === compareRow) {
                        continue;
                    }

                    const compareLetter = matrix[compareRow].letters[column].letter;

                    if (letter === compareLetter) {
                        matrix[row].letters[column].matches++;

                        const similarities = matrix[row].similarities;
                        const compareWordIndex = matrix[compareRow].wordIndex;
                        const compareWord = matrix[compareRow].word;
                        const compareLetterObject = matrix[compareRow].letters[column];

                        const [exists] = similarities.filter(({wordIndex}) => compareWordIndex === wordIndex);
                        if (!exists) {
                            similarities.push({
                                wordIndex: compareWordIndex,
                                word: compareWord,
                                commonLetters: [
                                    compareLetterObject
                                ]
                            });
                        } else {
                            exists.commonLetters.push(compareLetterObject);
                        }
                    }
                }
            }
        }

        this.matrix = matrix;
        this.updateUi();
    },

    showResults: function(data = this.matrix) {
        const sortedMatrix = this.sortData(data);
        const html = `
            <div class="row heading">
                <div class="cell number"></div>
                <div class="cell">WORD</div>
                <div class="cell">MATCHES</div>
                <div class="cell r">LIKENESS</div>
            </div>
            ${
                sortedMatrix.map((row, index) => {
                    const wordIndex = row.wordIndex;
                    const word = row.word.toUpperCase();
                    const totalMatches = row.totalMatches();
                    const likeness = row.likeness !== null ? row.likeness : '';
                    const display = row.display ? '' : 'off';

                    return `
                        <div class="row ${display}">
                            <div class="cell number">${index + 1}</div>
                            <div class="cell word">${word}</div>
                            <div class="cell matches">${totalMatches}</div>
                            <div class="cell r">
                                <input type="text" name="likeness" class="likeness text-input" id="${wordIndex}" value="${likeness}">
                            </div>
                        </div>
                    `;
                }).join('')
            }
        `;

        this.ui.results.innerHTML = html;
        this.ui.results.classList.add('on');
    }
}

const init = function () {
    terminal.addMainEvents();
    if (terminal.debug) {
        terminal.runDebug();
    }
}

function ready(init) {
    if (document.readyState !== 'loading') {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }
}

ready(init);
