var terminal = {
    sample: [ 'spies', 'joins', 'tires', 'trick', 'tried', 'skies', 'teams', 'third', 'fries', 'price', 'tries', 'trite', 'thank', 'thick', 'tribe', 'texas' ],
    common: [],
    sorted: [],
    matches: [],

    findCommon:function(data){

        var result = [],
            hits,
            length = data.length;
        
        for (var i = 0; i < length; i++) {
            
            var a = data[i];
            result.push( { 'base': a, 'hits': [], 'matches': {} } );
            for (var j = 0; j < length; j++) {

                var b = data[j];
                if(a != b){

                    aSplit = a.split('');
                    bSplit = b.split('');
                    for (var k = 0; k < aSplit.length; k++) {

                        if(aSplit[k] == bSplit[k]){
                            result[i]['hits'].push( { 'matched': b, 'pos':k, 'letter':aSplit[k] } );
                            
                            if(typeof result[i]['matches'][b] != 'undefined'){
                                result[i]['matches'][b] += 1;
                            } else {
                                result[i]['matches'][b] = 1;
                            }
                        }
                    };
                } 
            };
        };

        terminal.common = result;

        terminal.sortCommon();

        terminal.drawSorted();

    },

    sortCommon:function(){
        terminal.sorted = [];
        common = terminal.common;
        while(common.length > 0){
            highest = terminal.findMaxHits(0, 1);
            terminal.sorted.push(common[highest]);
            common.splice(highest, 1);
        }
        terminal.common = common;
    },

    findMaxHits:function(highest, current){

        common = terminal.common;

        if(current < common.length){
            if(common[highest]['hits'].length < common[current]['hits'].length){
                highest = current;
            }
            return this.findMaxHits(highest, current + 1);
        } else {
            return highest;
        }

    },

    drawSorted:function(){
        html = '<div class="row heading">';
            html += '<div class="cell">WORD</div>';
            html += '<div class="cell">HITS</div>';
            html += '<div class="cell">NO. MATCHED</div>';
            html += '<div class="cell r">FILTER RESULTS</div>';
        html += '</div>';
        for (var i = 0; i < terminal.sorted.length; i++) {
            html += '<div id="entry-'+i+'" class="row">';
                html += '<div class="cell word">'+terminal.sorted[i]['base'].toUpperCase()+'</div>';
                html += '<div class="cell hits">'+terminal.sorted[i]['hits'].length+'</div>';
                html += '<div class="cell matched"><input type="text" name="matched"></div>';
                html += '<div class="cell filter r"><input type="button" class="button" value="FILTER"></div>';
            html += '</div>';
        };

        $('#results').html(html).css('display', 'table');
    },

    filterMatched:function(entryIndex, noMatched){
        sorted = terminal.sorted;
        matches = sorted[entryIndex]['matches'];
        result = [];
        found = [];
        newCommon = [],

        $('.row').removeClass('on');

        for (match in matches) {
            if(matches[match] == noMatched){
                result.push(match);
            }
        };

        for (var i = 0; i < result.length; i++) {
            for (var j = 0; j < sorted.length; j++) {   
                if(result[i] == sorted[j]['base']){
                    found.push(j);
                    $('#entry-'+j).addClass('on');
                }
            };
        };

        //create new common array to get rid of non-matches
        for (var i = 0; i < found.length; i++) {
            newCommon.push(sorted[found[i]]);
        };

        terminal.common = newCommon;

        terminal.sortCommon();
        terminal.drawSorted();
    }


}
$(document).ready(function(){
    // terminal.findCommon(terminal.sample);
    // $('#results').find('.row#entry-0').find('input[name="matched"]').val(2);
})
.on('click', '#reset', function(e){
    $('#entry').val('');
    $('#results').html('').css('display', 'none');
    terminal.common = [];
    terminal.sorted = [];
    terminal.matches = [];
})
.on('click', '#hack', function(e){
    if($('#entry').val().length > 0){
        data = $('#entry').val().split('\n');
        terminal.findCommon(data);
    }
})
.on('click', '.filter', function(e){
    entryIndex = $(this).parents('.row').attr('id').split('-')[1];
    matched = $(this).parents('.row').children('.matched').children('input[name="matched"]').val();
    terminal.filterMatched(entryIndex, matched);
})
.on('change', 'input[name="matched"]', function(){
    $(this).parents('.row').children('.filter').children('.button').focus();
})
;
