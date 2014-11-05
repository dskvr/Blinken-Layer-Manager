 var socket = io('http://localhost:1337');

  var layers, sources, grid, dimensions;

  $(function(){
    $('button#create-layer').click(create_layer);
    $("select#sources").change(refresh_source_options);
    // $('li.layer button.destroy-layer').live('click', destroy_layer);
  });

  var html = new Object();

  html.layer = function(){
    return '<li id="'+this.id+'" class="layer" data-source="'+this.source.name+'"><h1>Layer '+this.id+' ('+this.name+')</h1><span class="status'+( (this.source.active) ? 'active' : '' )+'"></span><h2>'+this.source.name+'</h2><button class="destroy-layer" data-id="'+this.id+'">Delete</button><div data-id="'+this.id+'" class="source-options"><form class="update"><button class="update-layer" data-id="'+this.id+'">Update</button></form></div></li>';
  }
  html.source = function(key){
    return '<option id="'+key+'" class="source" value="'+this.name+'">'+this.name+'</option>';
  }

  html.source_option = function(key){
    return '<li id="'+key+'" class="source-option"><label for="'+this.name+'">'+this.name+'</label><input type="text" id="'+this.name+'" name="'+this.name+'" value="'+this.default+'" /></li>';
  }

  function create_layer(event){ 
    event.preventDefault();
    var formdata = $('form#source-options').serializeObject();
    // var source_options = JSON.stringify(formdata);
    // console.log(formdata)
    socket.emit('create layer', $('input#layer-name').val(), $('select#sources option:selected').val(), formdata);
  }

  function create_layer_success(layer_object){
    console.log('Layer successfully added.');
    console.dir(layer_object);
    socket.emit('list layers');
  }

  function update_layer(event){
    event.preventDefault();
    var source_options = $('li.layer#'+layer_id).find('form.update').serializeObject();
    var layer_id = $(this).attr('data-id');
    socket.emit('update layer', layer_id, source_options);
  }

  function destroy_layer(){
    var layer_id = $(this).attr('data-id');
    console.log('delete layer '+layer_id);
    socket.emit('destroy layer', layer_id);
  }

  function refresh_layers(layers_array){ 
    layers = layers_array;
    console.log(layers);
    $('section#layers ul').empty();
    $.each(layers_array, function(key, layer){
      console.log(html.layer.apply(layer) );
      var $layer = $( html.layer.apply(layer) ).appendTo('section#layers ul');
      $layer.find('button.destroy-layer').bind('click', destroy_layer);
      $layer.find('button.update-layer').bind('click', update_layer);
      var source_option_html = '';
      $.each(sources[layer.id].options, function(key, option){
          source_option_html += html.source_option.apply( this );
      });
      $layer.find('.source-options form').prepend(source_option_html);
      // $('section#layers ul').find('li#'+value.id+' button.destroy-layer').bind('click', destroy_layer);
    });
    console.log('Layers Refreshed');
    console.dir(layers_array);
  }

  function refresh_sources( sources_array ){ 
    sources = sources_array;
    $.each(sources, function(key, value){
      $('select#sources').append(html.source.apply(value, [key]));
    });
    refresh_source_options();
  }

  function refresh_source_options(){ 
    $('form#source-options ul').empty();

    var index = $('select#sources option:selected').attr('id');
    $.each(sources[index].options, function(key, option){
      $('form#source-options ul').append( html.source_option.apply(this, [key] ))
    });
  }

  function refresh_grid( grid_array ){
    grid = grid_array;
    // $('section#grid').html(grid_html);
    // console.log(grid_html)
    // console.log('refreshing grid...');
    // if( $('section#grid table').length == 0 ) { draw_grid(); }
    // $.each(grid, function(key, value){ 
      draw_grid();
      // $('section#grid table td#'+key).css('background-color', 'rgb('+value[0]+','+value[1]+','+value[2]+')');
    // })

    // $('section#grid').html(JSON.stringify(grid));
  }

  function grid_dimensions( dim ){
    console.dir(dim);
    dimensions = dim;
  }

  function draw_grid( ) {
    var $grid = $('#grid ul')
    var total = grid.length;

    // console.dir(dimensions);
    var html = '<table cellspacing="0" width="100%" height="100%">';
    var key = 0;
   for(var x = 0; x < dimensions.width; x++){
      html += '<tr class="row">'
      for(var y = 0; y < dimensions.height; y++){
        var r = grid[key][0],
            g = grid[key][1],
            b = grid[key][2];

        html += '<td class="pixel" id="'+key+'" style="background:rgb('+r+','+g+','+b+')"></td>';

        key++;

      }
      html += '</tr>'
    }

    $( 'section#grid' ).html( html );
  }

  // function refresh_mixer(){
  //   console.log('Mixer updated.');
  //   socket.emit('list layers');
  //   socket.emit('list sources');
  // }

  function error_log(error){
    console.log(error);
  }

  socket.emit('list layers');
  socket.on('refresh layers', refresh_layers);

  socket.emit('list sources');
  socket.on('refresh sources', refresh_sources);

  socket.emit('get grid dimensions');
  socket.on('grid dimensions',  grid_dimensions);

  // socket.emit('get grid');
  socket.on('refresh grid', refresh_grid);

  // socket.on('mixer update', refresh_mixer);

  socket.on('layer created', create_layer_success);

  socket.on('error', error_log);