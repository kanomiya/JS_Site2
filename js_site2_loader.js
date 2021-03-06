/**
 * JS_Site2_Loader
 * 
 * Author: Kanomiya [2016]
 * License: MIT License
 */
$(function()
{
  var p = location.search.match(/p=(.*?)(&|$)/);
  //if (p != null && p[1] == 'index') location.href = location.href.replace(/(\?|&)p=index/, '');
  var id = p == null ? 'index' : p[1];
  
  var handleShortCode = function()
  {
    var tagContent = $('#content');
    
    tagContent.find('[href^=":"]').each(function()
    {
      $(this).attr('href', $(this).attr('href').replace(/^:/, '?p='));
    });

    tagContent.find('[src^="@"]').each(function()
    {
      $(this).attr('src', $(this).attr('src').replace(/^@/, 'media/'));
    });

    }
  
  var handleContent = function(data)
  {
    var text = data['content'];
    var tagContent = $('#content');
    
    if (data['meta'])
    {
      if (0 <= data['meta'].indexOf('math'))
      {
        $.getScript('https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML');
      }
      
      if (0 <= data['meta'].indexOf('md')) 
      {
        $.getScript('vendor/marked.js', function(script)
        {
          tagContent.html(marked(tagContent.html()));
          handleShortCode();
        });
      }
    }
    
    tagContent.html(text);
    handleShortCode();
  }

  var handleNaviAnchor = function(anchor)
  {
    var type = anchor['type'] || 'book';
    
    var ul = $('<ul>');
    
    switch (type)
    {
      case 'book':
        if (anchor['prev'])
        {
          var p = anchor['prev'].match(/^:/) ? '?p=' + anchor['prev'].substr(1) : anchor['prev'];
          ul.append($('<li>').append($('<a>').text('前へ').attr('href', p)));
        }
        if (anchor['next'])
        {
          var p = anchor['next'].match(/^:/) ? '?p=' + anchor['next'].substr(1) : anchor['next'];
          ul.append($('<li>').append($('<a>').text('次へ').attr('href', p)));
        }
        break;
      case 'list':
        if (anchor['list'])
        {
          var i = anchor['list'].indexOf(id);
          
          if (0 < i) ul.append($('<li>').append($('<a>').text('前へ').attr('href', '?p=' + anchor['list'][i -1])));
          if (i +1 < anchor['list'].length) ul.append($('<li>').append($('<a>').text('次へ').attr('href', '?p=' + anchor['list'][i +1])));
        }
        break;
    }
    
    $('#navi').prepend(ul);
  }
  
  var handleNavi = function(data)
  {
    if (data['anchor'])
    {
      if (data['anchor'] instanceof Object) handleNaviAnchor(data['anchor']);
      else
      {
        $.get('anchors/' + data['anchor'] + '.yaml', function(raw)
        {
          var anchorData = jsyaml.load(raw);
          handleNaviAnchor(anchorData);
        });
      }
    }
    
  }
  
  $.get('pages/' + id + '.yaml', function(raw)
  {
    var data = jsyaml.load(raw);
    
    if (! data['title']) data['title'] = 'No title';
    
    $('#title').text(data['title']);
    document.title = data['title'] + ' | ' + document.title;
    
    handleContent(data);
    handleNavi(data);
    
  });
});
