const terminal = {
    debug: false,
    sample: ['caves', 'vents', 'pages', 'cried', 'actor', 'mines', 'dried', 'races', 'paper', 'vault', 'green', 'noted', 'helps', 'creed', 'plate', 'types', 'games', 'holes', 'pouch', 'plush'],
    matrix: {},

    ui: {
        entry: document.querySelector('#entry'),
        reset: document.querySelector('#reset'),
        run: document.querySelector('#run'),
        likeness: document.querySelectorAll('.likeness'),
        results: document.querySelector('#results'),
    },

    runDebug: function() {
        this.ui.entry.value = terminal.sample.join('\n');
        const runEvent = new Event('click');
        this.ui.run.dispatchEvent(runEvent);

        console.log('terminal', terminal);
        console.log('this.matrix', this.matrix);

        this.ui.likeness[0].value = 1;
        const likenessEvent = new Event('input');
        this.ui.likeness[0].dispatchEvent(likenessEvent);
    },

    // used for the static portions of the UI that don't get rebuilt
    addMainEvents: function () {
        this.ui.reset.addEventListener('click', (event) => {
            this.ui.entry.value = '';
            this.ui.results.innerHTML = '';
            this.ui.results.classList.remove('on');
            this.removeResultsEvents();
        });

        this.ui.run.addEventListener('click', (event) => {
            if (this.ui.entry.value.length <= 0) {
                return;
            }

            this.findSimilarities();
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
        const likeness = parseInt(event.target.value, 10) || 0;

        // only allow numeric values
        // don't display 0's
        if (!likeness) {
            event.target.value = '';
        }
        const targetWordIndex = parseInt(event.target.id, 10);
        const [entry] = terminal.matrix.filter(({wordIndex}) => wordIndex === targetWordIndex);
        entry.likeness = likeness;

        this.filterMatrixByLikeness();
        this.updateUi();
    },

    // The contents of the results table are dynamic and events need to be handled separately
    addResultsEvents() {
        this.ui.likeness.forEach((element) => element.addEventListener('input', this.likenessEventHandler.bind(this)));
    },

    removeResultsEvents() {
        this.ui.likeness.forEach((element) => element.removeEventListener('input', this.likenessEventHandler.bind(this)));
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
                likeness: 0,
                similarities: []
            };
        });
    },

    // returns a new matrix sorted by highest totalMatches in descending order
    sortData: function (data) {
        return [...data].sort((a, b) => b.totalMatches() - a.totalMatches());
    },

    // returns a new matrix with entries that have an exact matching likeness
    filterMatrixByLikeness: function() {
        const data = [...this.matrix];

        const highestLikeness = Math.max(...data.map(({likeness}) => likeness))

        const wordsToCompare = data.filter(({likeness}) => likeness === highestLikeness);

        if (wordsToCompare.length < 1) {
            return data;
        }

        // find other words that have a similar likeness
        // this won't include the word we are comparing against
        const [matchingWordIndexes] = wordsToCompare
            .map(({likeness, similarities}) => similarities
                .filter(({commonLetters}) => commonLetters.length === likeness)
                .map(({wordIndex}) => wordIndex)
        );

        console.log('matchingWordIndexes', matchingWordIndexes);

        const matchingWords = data
            .filter(({wordIndex}) => 
                matchingWordIndexes.includes(wordIndex)
                // don't include words we're already comparing against, it introduces duplicates
                && !wordsToCompare.map(({wordIndex}) => wordIndex).includes(wordIndex)
            );

        const combined = [...wordsToCompare, ...matchingWords].map(({wordIndex}) => wordIndex);

        data.forEach((entry) => {
            entry.display = combined.includes(entry.wordIndex);
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
                <div class="cell">WORD</div>
                <div class="cell">MATCHES</div>
                <div class="cell r">LIKENESS</div>
            </div>
            ${
                sortedMatrix.map((row) => {
                    const wordIndex = row.wordIndex;
                    const word = row.word.toUpperCase();
                    const totalMatches = row.totalMatches();
                    const likeness = row.likeness ? row.likeness : '';
                    const display = row.display ? '' : 'off';
                    const disabled = display === 'off';
                    return `
                        <div class="row ${display}">
                            <div class="cell word">${word}</div>
                            <div class="cell matches">${totalMatches}</div>
                            <div class="cell r">
                                <input type="text" name="likeness" class="likeness text-input" id="${wordIndex}" value="${likeness}" ${disabled ? 'disabled' : ''}>
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
