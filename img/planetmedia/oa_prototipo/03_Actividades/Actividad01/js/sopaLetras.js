$(document).ready( function () {
        var words = "VISUALIZAR,EDITAR,DUPLICAR,DESCARGAR";
        $("#theGrid").wordsearchwidget({"wordlist" : words,"gridsize" : 13});
    });

(function($, undefined) {
    var encontradas = 0;
    var totalpalabras = 0;
    var intentos = 3;
    
    $.widget("ryanf.wordsearchwidget", $.ui.mouse, {
        options: {
            wordlist: null,
            gridsize: 10
        },
        _mapEventToCell: function(event) {
            var currentColumn = Math.ceil((event.pageX - this._cellX) / this._cellWidth);
            var currentRow = Math.ceil((event.pageY - this._cellY) / this._cellHeight);
            var el = $("#rf-tablegrid tr:nth-child(" + currentRow + ") td:nth-child(" + currentColumn + ")");
            return el
        },
        _create: function() {
            this.model = GameWidgetHelper.prepGrid(this.options.gridsize, this.options.wordlist);
            this.startedAt = new Root;
            this.hotzone = new Hotzone;
            this.arms = new Arms;
            GameWidgetHelper.renderGame(this.element[0], this.model);
            this.options.distance = 0;
            this._mouseInit();
            var cell = $("#rf-tablegrid tr:first td:first");
            this._cellWidth = cell.outerWidth();
            this._cellHeight = cell.outerHeight();
            this._cellX = cell.offset().left;
            this._cellY = cell.offset().top
        },
        destroy: function() {
            this.hotzone.clean();
            this.arms.clean();
            this.startedAt.clean();
            this._mouseDestroy();
            return this
        },
        _mouseStart: function(event) {
            var panel = $(event.target).parents("div").attr("id");
            if (panel == "rf-searchgamecontainer") {
                this.startedAt.setRoot(event.target);
                this.hotzone.createZone(event.target)
            } else if (panel == "rf-wordcontainer") {
                var idx = $(event.target).parent().children().index(event.target);
                var selectedWord = this.model.wordList.get(idx)
            }
        },
        _mouseDrag: function(event) {
            event.target = this._mapEventToCell(event);
            if (this.startedAt.isSameCell(event.target)) {
                this.arms.returnToNormal();
                this.hotzone.setChosen(-1);
                return
            }
            if ($(event.target).hasClass("rf-armed") || $(event.target).hasClass("rf-glowing")) {
                var chosenOne =
                    this.hotzone.index(event.target);
                if (chosenOne != -1) {
                    this.hotzone.setChosen(chosenOne);
                    this.arms.deduceArm(this.startedAt.root, chosenOne)
                } else this.arms.glowTo(event.target)
            }
        },
        _mouseStop: function(event) {
            var selectedword = "";
            $(".rf-glowing, .rf-highlight", this.element[0]).each(function() {
                var u = $.data(this, "cell");
                selectedword += u.value
            });
            var wordIndex = this.model.wordList.isWordPresent(selectedword);
            if (wordIndex != -1) {
                $(".rf-glowing, .rf-highlight", this.element[0]).each(function() {
                    Visualizer.select(this);
                    $.data(this, "selected", "true")
                });
                GameWidgetHelper.signalWordFound(wordIndex)
            }
            else{
                if(intentos > 0){
                    $('#intento').fadeIn();
                    document.getElementById('retro-intentos').innerHTML = "<p>" + intentos + " intentos restantes</p>";
                    intentos = intentos - 1;
                }
                else{
                    $('#fin-intento').fadeIn();
                    document.getElementById('retro-intentos-fin').innerHTML = "<p>" + intentos + " intentos restantes</p>";
                }                
            }
            this.hotzone.returnToNormal();
            this.startedAt.returnToNormal();
            this.arms.returnToNormal()
        }
    });
    $.extend($.ryanf.wordsearchwidget, {
        version: "0.0.1"
    });

    function Arms() {
        this.arms = null;
        this.deduceArm = function(root, idx) {
            this.returnToNormal();
            var ix = $(root).parent().children().index(root);
            this.arms = new Array;
            switch (idx) {
                case 0:
                    this.arms = $(root).prevAll();
                    break;
                case 1:
                    this.arms = $(root).nextAll();
                    break;
                case 2:
                    var $n = this.arms;
                    $(root).parent().prevAll().each(function() {
                        $n.push($(this).children().get(ix))
                    });
                    break;
                case 3:
                    var $o = this.arms;
                    $(root).parent().nextAll().each(function() {
                        $o.push($(this).children().get(ix))
                    });
                    break;
                case 4:
                    var $p = this.arms;
                    var currix = ix;
                    $(root).parent().prevAll().each(function() {
                        $p.push($(this).children().get(++currix))
                    });
                    break;
                case 5:
                    var $q = this.arms;
                    var currixq = ix;
                    $(root).parent().prevAll().each(function() {
                        $q.push($(this).children().get(--currixq))
                    });
                    break;
                case 6:
                    var $r = this.arms;
                    var currixr = ix;
                    $(root).parent().nextAll().each(function() {
                        $r.push($(this).children().get(++currixr))
                    });
                    break;
                case 7:
                    var $s = this.arms;
                    var currixs = ix;
                    $(root).parent().nextAll().each(function() {
                        $s.push($(this).children().get(--currixs))
                    });
                    break
            }
            for (var x = 1; x < this.arms.length; x++) Visualizer.arm(this.arms[x])
        };
        this.glowTo = function(upto) {
            var to = $(this.arms).index(upto);
            for (var x = 1; x < this.arms.length; x++)
                if (x <= to) Visualizer.glow(this.arms[x]);
                else Visualizer.arm(this.arms[x])
        };
        this.returnToNormal = function() {
            if (!this.arms) return;
            for (var t = 1; t < this.arms.length; t++) Visualizer.restore(this.arms[t])
        };
        this.clean =
            function() {
                $(this.arms).each(function() {
                    Visualizer.clean(this)
                })
            }
    }

    function Hotzone() {
        this.elems = null;
        this.createZone = function(root) {
            this.elems = new Array;
            var $tgt = $(root);
            var ix = $tgt.parent().children().index($tgt);
            var above = $tgt.parent().prev().children().get(ix);
            var below = $tgt.parent().next().children().get(ix);
            this.elems.push($tgt.prev()[0], $tgt.next()[0]);
            this.elems.push(above, below, $(above).next()[0], $(above).prev()[0], $(below).next()[0], $(below).prev()[0]);
            $(this.elems).each(function() {
                if ($(this) !=
                    null) Visualizer.arm(this)
            })
        };
        this.index = function(elm) {
            return $(this.elems).index(elm)
        };
        this.setChosen = function(chosenOne) {
            for (var x = 0; x < this.elems.length; x++) Visualizer.arm(this.elems[x]);
            if (chosenOne != -1) Visualizer.glow(this.elems[chosenOne])
        };
        this.returnToNormal = function() {
            for (var t = 0; t < this.elems.length; t++) Visualizer.restore(this.elems[t])
        };
        this.clean = function() {
            $(this.elems).each(function() {
                Visualizer.clean(this)
            })
        }
    }

    function Root() {
        this.root = null;
        this.setRoot = function(root) {
            this.root = root;
            Visualizer.glow(this.root)
        };
        this.returnToNormal = function() {
            Visualizer.restore(this.root)
        };
        this.isSameCell = function(t) {
            return $(this.root).is($(t))
        };
        this.clean = function() {
            Visualizer.clean(this.root)
        }
    }
    var Visualizer = {
        glow: function(c) {
            $(c).removeClass("rf-armed").removeClass("rf-selected").addClass("rf-glowing")
        },
        arm: function(c) {
            $(c).removeClass("rf-glowing").addClass("rf-armed")
        },
        restore: function(c) {
            $(c).removeClass("rf-armed").removeClass("rf-glowing");
            if (c != null && $.data(c, "selected") == "true"){
                $(c).addClass("rf-selected")
            }
            
        },
        select: function(c) {
            $(c).removeClass("rf-armed").removeClass("rf-glowing").animate({
                    "opacity": "20"
                },
                500, "linear",
                function() {
                    $(c).removeClass("rf-highlight").addClass("rf-selected").animate({
                        "opacity": "show"
                    }, 500, "linear")
                })
        },
        highlight: function(c) {
            $(c).removeClass("rf-armed").removeClass("rf-selected").addClass("rf-highlight")
        },
        signalWordFound: function(w) {
            $(w).css("background", "yellow").animate({
                "opacity": "hide"
            }, 1E3, "linear", function() {
                $(w).css("background", "none");
                $(w).addClass("rf-foundword").animate({
                    "opacity": "show"
                }, 1E3, "linear")
            })
        },
        clean: function(c) {
            $(c).removeClass("rf-armed").removeClass("rf-glowing").removeClass("rf-selected");
            $.removeData($(c), "selected")
            
        }
    };

    function Cell() {
        this.DEFAULT = "-";
        this.isHighlighted = false;
        this.value = this.DEFAULT;
        this.parentGrid = null;
        this.isUnwritten = function() {
            return this.value == this.DEFAULT
        };
        this.isSelected = false;
        this.isSelecting = true;
        this.td = null
    }

    function Grid() {
        this.cells = null;
        this.directions = ["LeftDiagonal", "Horizontal", "RightDiagonal", "Vertical"];
        this.initializeGrid = function(size) {
            this.cells = new Array(size);
            for (var i = 0; i < size; i++) {
                this.cells[i] = new Array(size);
                for (var j = 0; j < size; j++) {
                    var c =
                        new Cell;
                    c.parentgrid = this;
                    this.cells[i][j] = c
                }
            }
        };
        this.getCell = function(row, col) {
            return this.cells[row][col]
        };
        this.createHotZone = function(uic) {
            var $tgt = uic;
            var hzCells = new Array;
            var ix = $tgt.parent().children().index($tgt)
        };
        this.size = function() {
            return this.cells.length
        };
        this.put = function(row, col, word) {
            var populator = eval("new " + eval("this.directions[" + Math.floor(Math.random() * 3) + "]") + "Populator(row,col,word, this)");
            var isPlaced = populator.populate();
            if (!isPlaced)
                for (var x = 0; x < this.directions.length; x++) {
                    var populator2 =
                        eval("new " + eval("this.directions[" + x + "]") + "Populator(row,col,word, this)");
                    var isPlaced2 = populator2.populate();
                    if (isPlaced2) break
                }
        };
        this.fillGrid = function() {
            for (var i = 0; i < this.size(); i++)
                for (var j = 0; j < this.size(); j++)
                    if (this.cells[i][j].isUnwritten()) this.cells[i][j].value = String.fromCharCode(Math.floor(65 + Math.random() * 26))
        }
    }

    function HorizontalPopulator(row, col, word, grid) {
        this.grid = grid;
        this.row = row;
        this.col = col;
        this.word = word;
        this.size = this.grid.size();
        this.cells = this.grid.cells;
        this.populate =
            function() {
                if (this.willWordFit()) this.writeWord();
                else
                    for (var i = 0; i < this.size; i++) {
                        var xRow = (this.row + i) % this.size;
                        var startingPoint = this.findContigousSpace(xRow, word);
                        if (startingPoint == -1) {
                            var overlapPoint = this.isWordOverlapPossible(xRow, word);
                            if (overlapPoint == -1) continue;
                            else {
                                this.row = xRow;
                                this.col = overlapPoint;
                                this.writeWord();
                                break
                            }
                        } else {
                            this.row = xRow;
                            this.col = startingPoint;
                            this.writeWord();
                            break
                        }
                    }
                return word.isPlaced
            };
        this.writeWord = function() {
            var chars = word.chars;
            for (var i = 0; i < word.size; i++) {
                var c =
                    new Cell;
                c.value = chars[i];
                this.cells[this.row][this.col + i] = c;
                word.containedIn(c);
                word.isPlaced = true
            }
        };
        this.isWordOverlapPossible = function(row, word) {
            return -1
        };
        this.willWordFit = function() {
            var isFree = false;
            var freeCounter = 0;
            var chars = this.word.chars;
            for (var i = col; i < this.size; i++)
                if (this.cells[row][i].isUnwritten() || this.cells[row][i] == chars[i]) {
                    freeCounter++;
                    if (freeCounter == word.size) {
                        isFree = true;
                        break
                    }
                } else break;
            return isFree
        };
        this.findContigousSpace = function(row, word) {
            var freeLocation = -1;
            var freeCounter =
                0;
            var chars = word.chars;
            for (var i = 0; i < this.size; i++)
                if (this.cells[row][i].isUnwritten() || this.cells[row][i] == chars[i]) {
                    freeCounter++;
                    if (freeCounter == word.size) {
                        freeLocation = i - (word.size - 1);
                        break
                    }
                } else freeCounter = 0;
            return freeLocation
        }
    }

    function VerticalPopulator(row, col, word, grid) {
        this.grid = grid;
        this.row = row;
        this.col = col;
        this.word = word;
        this.size = this.grid.size();
        this.cells = this.grid.cells;
        this.populate = function() {
            if (this.willWordFit()) this.writeWord();
            else
                for (var i = 0; i < this.size; i++) {
                    var xCol = (this.col +
                        i) % this.size;
                    var startingPoint = this.findContigousSpace(xCol, word);
                    if (startingPoint == -1) {
                        var overlapPoint = this.isWordOverlapPossible(xCol, word);
                        if (overlapPoint == -1) continue;
                        else {
                            this.row = overlapPoint;
                            this.col = xCol;
                            this.writeWord();
                            break
                        }
                    } else {
                        this.row = startingPoint;
                        this.col = xCol;
                        this.writeWord();
                        break
                    }
                }
            return word.isPlaced
        };
        this.writeWord = function() {
            var chars = word.chars;
            for (var i = 0; i < word.size; i++) {
                var c = new Cell;
                c.value = chars[i];
                this.cells[this.row + i][this.col] = c;
                word.containedIn(c);
                word.isPlaced =
                    true
            }
        };
        this.isWordOverlapPossible = function(col, word) {
            return -1
        };
        this.willWordFit = function() {
            var isFree = false;
            var freeCounter = 0;
            var chars = this.word.chars;
            for (var i = row; i < this.size; i++)
                if (this.cells[i][col].isUnwritten() || chars[i] == this.cells[i][col].value) {
                    freeCounter++;
                    if (freeCounter == word.size) {
                        isFree = true;
                        break
                    }
                } else break;
            return isFree
        };
        this.findContigousSpace = function(col, word) {
            var freeLocation = -1;
            var freeCounter = 0;
            var chars = word.chars;
            for (var i = 0; i < this.size; i++)
                if (this.cells[i][col].isUnwritten() ||
                    chars[i] == this.cells[i][col].value) {
                    freeCounter++;
                    if (freeCounter == word.size) {
                        freeLocation = i - (word.size - 1);
                        break
                    }
                } else freeCounter = 0;
            return freeLocation
        }
    }

    function LeftDiagonalPopulator(row, col, word, grid) {
        this.grid = grid;
        this.row = row;
        this.col = col;
        this.word = word;
        this.size = this.grid.size();
        this.cells = this.grid.cells;
        this.populate = function() {
            if (this.willWordFit()) this.writeWord();
            else {
                var output = this.findContigousSpace(this.row, this.col, word);
                if (output[0] != true) OUTER: for (var col = 0, row = this.size - word.size; row >=
                    0; row--)
                    for (var j = 0; j < 2; j++) {
                        var op = this.findContigousSpace(j == 0 ? row : col, j == 0 ? col : row, word);
                        if (op[0] == true) {
                            this.row = op[1];
                            this.col = op[2];
                            this.writeWord();
                            break OUTER
                        }
                    } else {
                        this.row = output[1];
                        this.col = output[2];
                        this.writeWord()
                    }
            }
            return word.isPlaced
        };
        this.writeWord = function() {
            var chars = word.chars;
            var lrow = this.row;
            var lcol = this.col;
            for (var i = 0; i < word.size; i++) {
                var c = new Cell;
                c.value = chars[i];
                this.cells[lrow++][lcol++] = c;
                word.containedIn(c);
                word.isPlaced = true
            }
        };
        this.isWordOverlapPossible = function(row,
            word) {
            return -1
        };
        this.willWordFit = function() {
            var isFree = false;
            var freeCounter = 0;
            var chars = this.word.chars;
            var lrow = this.row;
            var lcol = this.col;
            var i = 0;
            while (lcol < this.grid.size() && lrow < this.grid.size()) {
                if (this.cells[lrow][lcol].isUnwritten() || this.cells[lrow][lcol] == chars[i++]) {
                    freeCounter++;
                    if (freeCounter == word.size) {
                        isFree = true;
                        break
                    }
                } else break;
                lrow++;
                lcol++
            }
            return isFree
        };
        this.findContigousSpace = function(xrow, xcol, word) {
            var freeLocation = false;
            var freeCounter = 0;
            var chars = word.chars;
            var lrow = xrow;
            var lcol = xcol;
            while (lrow > 0 && lcol > 0) {
                lrow--;
                lcol--
            }
            var i = 0;
            while (true) {
                if (this.cells[lrow][lcol].isUnwritten() || this.cells[lrow][lcol] == chars[i++]) {
                    freeCounter++;
                    if (freeCounter == word.size) {
                        freeLocation = true;
                        break
                    }
                } else freeCounter = 0;
                lcol++;
                lrow++;
                if (lcol >= this.size || lrow >= this.size) break
            }
            if (freeLocation) {
                lrow = lrow - word.size + 1;
                lcol = lcol - word.size + 1
            }
            return [freeLocation, lrow, lcol]
        }
    }

    function RightDiagonalPopulator(row, col, word, grid) {
        this.grid = grid;
        this.row = row;
        this.col = col;
        this.word = word;
        this.size = this.grid.size();
        this.cells = this.grid.cells;
        this.populate = function() {
            var rr = 0;
            if (this.willWordFit()) this.writeWord();
            else {
                var output = this.findContigousSpace(this.row, this.col, word);
                if (output[0] != true) OUTER: for (var col = this.size - 1, row = this.size - word.size; row >= 0; row--)
                    for (var j = 0; j < 2; j++) {
                        var op = this.findContigousSpace(j == 0 ? row : this.size - 1 - col, j == 0 ? col : this.size - 1 - row, word);
                        if (op[0] == true) {
                            this.row = op[1];
                            this.col = op[2];
                            this.writeWord();
                            break OUTER
                        }
                    } else {
                        this.row = output[1];
                        this.col = output[2];
                        this.writeWord()
                    }
            }
            return word.isPlaced
        };
        this.writeWord = function() {
            var chars = word.chars;
            var lrow = this.row;
            var lcol = this.col;
            for (var i = 0; i < word.size; i++) {
                var c = new Cell;
                c.value = chars[i];
                this.cells[lrow++][lcol--] = c;
                word.containedIn(c);
                word.isPlaced = true
            }
        };
        this.isWordOverlapPossible = function(row, word) {
            return -1
        };
        this.willWordFit = function() {
            var isFree = false;
            var freeCounter = 0;
            var chars = this.word.chars;
            var lrow = this.row;
            var lcol = this.col;
            var i = 0;
            while (lcol >= 0 && lrow < this.grid.size()) {
                if (this.cells[lrow][lcol].isUnwritten() || this.cells[lrow][lcol] ==
                    chars[i++]) {
                    freeCounter++;
                    if (freeCounter == word.size) {
                        isFree = true;
                        break
                    }
                } else break;
                lrow++;
                lcol--
            }
            return isFree
        };
        this.findContigousSpace = function(xrow, xcol, word) {
            var freeLocation = false;
            var freeCounter = 0;
            var chars = word.chars;
            var lrow = xrow;
            var lcol = xcol;
            while (lrow > 0 && lcol < this.size - 1) {
                lrow--;
                lcol++
            }
            var i = 0;
            while (lcol >= 0 && lrow < this.grid.size()) {
                if (this.cells[lrow][lcol].isUnwritten() || this.cells[lrow][lcol] == chars[i++]) {
                    freeCounter++;
                    if (freeCounter == word.size) {
                        freeLocation = true;
                        break
                    }
                } else freeCounter =
                    0;
                lrow++;
                lcol--
            }
            if (freeLocation) {
                lrow = lrow - word.size + 1;
                lcol = lcol + word.size - 1
            }
            return [freeLocation, lrow, lcol]
        }
    }

    function Model() {
        this.grid = null;
        this.wordList = null;
        this.init = function(grid, list) {
            this.grid = grid;
            this.wordList = list;
            for (var i = 0; i < this.wordList.size(); i++) grid.put(Util.random(this.grid.size()), Util.random(this.grid.size()), this.wordList.get(i))
        }
    }

    function Word(val) {
        this.value = val.toUpperCase();
        this.originalValue = this.value;
        this.isFound = false;
        this.cellsUsed = new Array;
        this.isPlaced = false;
        this.row = -1;
        this.col = -1;
        this.size = -1;
        this.chars = null;
        this.init = function() {
            this.chars = this.value.split("");
            this.size = this.chars.length
        };
        this.init();
        this.containedIn = function(cell) {
            this.cellsUsed.push(cell)
        };
        this.checkIfSimilar = function(w) {
            if (this.originalValue == w || this.value == w) {
                this.isFound = true;
                return true
            }
            return false
        }
    }

    function WordList() {
        this.words = new Array;
        this.loadWords = function(csvwords) {
            var $n = this.words;
            $(csvwords.split(",")).each(function() {
                $n.push(new Word(this))
            })
        };
        this.add = function(word) {
            if (Math.random() *
                10 > 5) {
                var s = "";
                for (var i = word.size - 1; i >= 0; i--) s = s + word.value.charAt(i);
                word.value = s;
                word.init()
            }
            this.words[this.words.length] = word
        };
        this.size = function() {
            totalpalabras = this.words.length;
            return this.words.length
        };
        this.get = function(index) {
            return this.words[index]
        };
        this.isWordPresent = function(word2check) {
            for (var x = 0; x < this.words.length; x++)
                if (this.words[x].checkIfSimilar(word2check)) return x;
            return -1
        }
    }
    var Util = {
        random: function(max) {
            return Math.floor(Math.random() * max)
        },
        log: function(msg) {
            $("#logger").append(msg)
        }
    };
    var GameWidgetHelper = {
        prepGrid: function(size, words) {
            var grid = new Grid;
            grid.initializeGrid(size);
            var wordList = new WordList;
            wordList.loadWords(words);
            var model = new Model;
            model.init(grid, wordList);
            grid.fillGrid();
            return model
        },
        renderGame: function(container, model) {
            var grid = model.grid;
            var cells = grid.cells;
            var puzzleGrid = "<div id='rf-searchgamecontainer'><table id='rf-tablegrid' cellspacing=0 cellpadding=0 class='rf-tablestyle'>";
            for (var i = 0; i < grid.size(); i++) {
                puzzleGrid += "<tr>";
                for (var j = 0; j < grid.size(); j++) puzzleGrid +=
                    "<td  class='rf-tgrid'>" + cells[i][j].value + "</td>";
                puzzleGrid += "</tr>"
            }
            puzzleGrid += "</table></div>";
            $(container).append(puzzleGrid);
            var x = 0;
            var y = 0;
            $("tr", "#rf-tablegrid").each(function() {
                $("td", this).each(function(col) {
                    var c = cells[x][y++];
                    $.data(this, "cell", c);
                    c.td = this
                });
                y = 0;
                x++
            });
            var words = "<div id='rf-wordcontainer'><ul id='listwords'>";
            $(model.wordList.words).each(function() {
                words += "<li class=rf-p" + this.isPlaced + ">" + this.originalValue + "</li>"
            });
            words += "</ul></div>";
            $(container).append(words)
        },
        signalWordFound: function(idx) {
            var w = $("ul#listwords li").get(idx);
            Visualizer.signalWordFound(w);
            encontradas++;
            if (totalpalabras == encontradas){
			    $('#final_ok').fadeIn();
            }
            
        }
    }
})(jQuery);

$( ".back" ).click(function() {
    $('#final_ok').fadeOut();
    $('#intento').fadeOut();
});

$(document).ready(function() {
        $('.reload').click(function() {
            location.reload();
        });
    });
