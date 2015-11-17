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
            html += '<div class="word">WORD</div>';
            html += '<div class="hits">HITS</div>';
            html += '<div class="matched">NO. MATCHED</div>';
            html += '<div class="filter r">FILTER RESULTS</div>';
        html += '</div>';
        for (var i = 0; i < terminal.sorted.length; i++) {
            html += '<div id="entry-'+i+'" class="row">';
                html += '<div class="word">'+terminal.sorted[i]['base'].toUpperCase()+'</div>';
                html += '<div class="hits">'+terminal.sorted[i]['hits'].length+'</div>';
                html += '<div class="matched"><input type="text" name="matched"></div>';
                html += '<div class="filter r"><div class="button">FILTER</div></div>';
            html += '</div>';
        };

        $('#results').html(html).css('display', 'block');
    },

    findMaxHits:function(highest, current){

        common = terminal.common;

        if(current < common.length){
            // console.log('COMPARING: ', 'KEY[',highest,']', common[highest]['hits'].length, ' TO KEY[',current,']', common[current]['hits'].length);
            if(common[highest]['hits'].length < common[current]['hits'].length){
                highest = current;
            }

            // console.log(highest);

            return this.findMaxHits(highest, current + 1);
        } else {
            return highest;
        }

    },

    filterMatched:function(entryIndex, matched){
        entry = terminal.sorted[entryIndex];
        hits = entry['hits'];
        compiled = [];


        //want to compile new array with matching words and number of times they matched
        //like: compiled['word']['matches']
        //would read: 'SPIES', '3'
        current = hits[0]['matched'];
        count = 1;
        compiled.push(current);
        for (var i = 0; i < hits.length; i++) {
            next = hits[i]['matched'];

        };


        console.log(entry);
    }
}
$(document).ready(function(){
    terminal.findCommon(terminal.sample);
    $('#results').find('.row#entry-0').find('input[name="matched"]').val(2);
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
