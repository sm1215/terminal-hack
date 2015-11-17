var terminal = {
    sample: [ 'spies', 'joins', 'tires', 'trick', 'tried', 'skies', 'teams', 'third', 'fries', 'price', 'tries', 'trite', 'thank', 'thick', 'tribe', 'texas' ],
    common: [],
    sorted: [],

    findCommon:function(data){

        var result = [],
            hits,
            length = data.length;
        
        for (var i = 0; i < length; i++) {
            
            var a = data[i];
            result.push( { 'base': a, 'hits': [] } );
            for (var j = 0; j < length; j++) {

                var b = data[j];
                if(a != b){

                    aSplit = a.split('');
                    bSplit = b.split('');
                    for (var k = 0; k < aSplit.length; k++) {

                        if(aSplit[k] == bSplit[k]){
                            result[i]['hits'].push( { 'matched': b, 'pos':k, 'letter':aSplit[k] } );
                        }
                    };
                } 
            };
        };

        terminal.common = result;

        while(terminal.common.length > 0){
            highest = terminal.findMaxHits(0, 1);
            terminal.sorted.push(common[highest]);
            terminal.common.splice(highest, 1);
        }

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
                html += '<div class="cell filter r"><div class="button">FILTER</div></div>';
            html += '</div>';
        };

        $('#results').html(html).css('display', 'table');
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

    filterMatched:function(entryIndex, matched){
        entry = terminal.sorted[entryIndex];
        hits = entry['hits'];
        compiled = {};
        result = [];

        for (var i = 0; i < hits.length; i++) {
            current = hits[i]['matched'];

            if(typeof compiled[current] != 'undefined'){
                compiled[current] += 1;
            } else {
                compiled[current] = 1;
            }
        };

        for ( match in compiled ){
            if(compiled[match] == matched){
                result.push(match);
            }
        }

        for (var i = 0; i < result.length; i++) {
            var found;
            findthis = result[i];

            for (var j = 0; j < terminal.sorted.length; j++) {
                if(terminal.sorted[j].base == findthis){
                    $('#entry-'+j).css({'background': 'mediumspringgreen', 'color': '#052013'});
                    break;
                }

            };
        };
    }


}
$(document).ready(function(){
    terminal.findCommon(terminal.sample);
    $('#results').find('.row#entry-0').find('input[name="matched"]').val(2);
})
.on('click', '#reset', function(e){
    $('#entry').html('');
    $('#results').html('').css('display', 'none');
})
.on('click', '#hack', function(e){
    data = $('#entry').val().split('\n');
    terminal.findCommon(data);
})
.on('click', '.filter', function(e){
    entryIndex = $(this).parents('.row').attr('id').split('-')[1];
    matched = $(this).parents('.row').children('.matched').children('input[name="matched"]').val();
    terminal.filterMatched(entryIndex, matched);
})
;
