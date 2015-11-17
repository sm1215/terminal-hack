var terminal = {
    sample: [ 'spies', 'joins', 'tires', 'trick', 'tried', 'skies', 'teams', 'third', 'fries', 'price', 'tries', 'trite', 'thank', 'thick', 'tribe', 'texas' ],
    common: [],
    sorted: [],

    findCommon:function(data){

        var result = [],
            matches,
            length = data.length;
        
        for (var i = 0; i < length; i++) {
            
            var a = data[i];
            result.push( { 'base': a, 'matches': [] } );

            for (var j = 0; j < length; j++) {

                var b = data[j];

                if(a != b){
                    aSplit = a.split('');
                    bSplit = b.split('');

                    for (var k = 0; k < aSplit.length; k++) {

                        if(aSplit[k] == bSplit[k]){
                            result[i]['matches'].push( { 'matched': b, 'pos':k, 'letter':aSplit[k] } );
                        }

                    };

                } 

            };

        };

        terminal.common = result;

        while(terminal.common.length > 0){
            highest = terminal.findHighestMatched(0, 1);
            terminal.sorted.push(common[highest]);
            terminal.common.splice(highest, 1);
        }

        html = '<div class="row heading">';
            html += '<div class="word">WORD</div>';
            html += '<div class="matches">NO. MATCHES</div>';
        html += '</div>';
        for (var i = 0; i < terminal.sorted.length; i++) {
            html += '<div class="row">';
                html += '<div class="word">'+terminal.sorted[i]['base'].toUpperCase()+'</div>';
                html += '<div class="matches">'+terminal.sorted[i]['matches'].length+'</div>';
            html += '</div>';
        };

        $('#results').html(html).css('display', 'block');
    },

    findHighestMatched:function(highest, current){

        common = terminal.common;

        if(current < common.length){
            // console.log('COMPARING: ', 'KEY[',highest,']', common[highest]['matches'].length, ' TO KEY[',current,']', common[current]['matches'].length);
            if(common[highest]['matches'].length < common[current]['matches'].length){
                highest = current;
            }

            // console.log(highest);

            return this.findHighestMatched(highest, current + 1);
        } else {
            return highest;
        }

    }


}
$(document).ready(function(){
    // terminal.findCommon(terminal.sample);
})
.on('click', '#hack', function(e){
    data = $('#entry').val().split('\n');
    terminal.findCommon(data);
})
;
