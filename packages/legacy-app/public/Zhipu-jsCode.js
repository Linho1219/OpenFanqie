var upType = 3
$(document).ready(function () {
  var viewType_ = localStorage.getItem('viewType')
  if (viewType_) {
    upType = viewType_
  }
  var customCode_ = localStorage.getItem('customCode')
  if (customCode_) {
    $('textarea[name=customCode]').text(customCode_)
  }
  var pageConfig_ = localStorage.getItem('pageConfig')
  if (pageConfig_) {
    $('textarea[name=pageConfig]').text(pageConfig_)
  }
  setView(upType)
  if (upType == 2) {
    upType = 3
  }
  var autoJpFormat_ = localStorage.getItem('autoJpFormat')
  if (!autoJpFormat_) {
    autoJpFormat_ = 'y'
  }
  if (autoJpFormat_ == 'y') {
    $('#jpFormat').prop('checked', true)
  }
})
window.onresize = function () {
  autoSize()
  autoWinSize()
}
document.onkeydown = function () {
  return setShortcuts(event)
}
document.onmousedown = hideMenu
function setShortcuts(ev) {
  if (ev.keyCode == 9 && !$('.win').is(':visible')) {
    if (winType != 2) {
      upType = winType
      setView(2)
    } else {
      setView(upType)
    }
    autoSize()
    return false
  }
  if (ev.keyCode == 27) {
    hideMenu()
    winClose()
    return false
  }
  if (ev.altKey && ev.keyCode == 70) {
    $('#menuFile').click()
    return false
  }
  if (ev.altKey && ev.keyCode == 85) {
    $('#menuUser').click()
    return false
  }
  if (ev.altKey && ev.keyCode == 72) {
    $('#menuHelp').click()
    return false
  }
  if (ev.ctrlKey && ev.shiftKey && ev.keyCode == 83) {
    $('#menuSaveAs').click()
    return false
  }
  if (ev.ctrlKey && ev.keyCode == 83) {
    $('#menuSave').click()
    return false
  }
  if (ev.ctrlKey && ev.keyCode == 78) {
    $('#menuNewFile').click()
    return false
  }
  if (ev.ctrlKey && ev.keyCode == 79) {
    $('#menuOpenFile').click()
    return false
  }
  if (ev.ctrlKey && ev.keyCode == 81) {
    $('#menuPlayer').click()
    return false
  }
  if (ev.ctrlKey && ev.keyCode == 72) {
    $('#menuTutorial').click()
    return false
  }
  if (ev.ctrlKey && ev.keyCode == 192) {
    $('#menuSymbol').click()
    return false
  }
  if (ev.ctrlKey && ev.keyCode == 69) {
    $('#menuAddLastSymbol').click()
    return false
  }
  if (
    ev.keyCode == 37 ||
    ev.keyCode == 38 ||
    ev.keyCode == 39 ||
    ev.keyCode == 40 ||
    ev.keyCode == 46
  ) {
    return customShortcuts(ev.keyCode)
  }
}
function redraw(pNum, redrawSource) {
  var jpcode = window.frames['editFrame'].document.getElementById('editor_text').value
  var customCode = $('textarea[name=customCode]').text()
  var pageConfig = $('textarea[name=pageConfig]').text()
  jpcode = jpcode.replace(/\n/g, '&hh&')
  customCode = customCode.replace(/\n/g, '&hh&')
  window.openFanqieRendererReady.then(function (renderScore) {
    var re = renderScore(jpcode, {
      customCode: customCode,
      pageConfig: pageConfig,
      pageNum: pNum,
    })
    var arr = re.split('[fenye]')
    var arrLen = arr.length
    var pageNum = -1
    for (var i = 0; i < arrLen; i++) {
      var pageObj = $('#page_' + i)
      if (arr[i] != '') {
        if (pageObj.length == 0) {
          $('.preview .svgList').append(
            '<div class="page" id="page_' + i + '">' + arr[i] + '</div>',
          )
        } else {
          if (arr[i] != 'noRedraw') {
            pageObj.html(arr[i])
          }
        }
        pageNum++
      }
    }
    $('.page').each(function (index, element) {
      if (index > pageNum) {
        $(element).remove()
      }
    })
    if (pageNum == -1) {
      $('.preview .svgList').append('<div class="page" id="page_0"></div>')
    }
    var svgWidth = $('#page_0 svg').attr('width')
    var svgHeight = $('#page_0 svg').attr('height')
    $('.svgList').css({ width: svgWidth, height: svgHeight })
    $('.page').css({ width: svgWidth, height: svgHeight })
    $('use[notepos]').click(function (e) {
      window.frames['editFrame'].setPos($(this).attr('notepos'))
    })
    if (redrawSource == 'editor') {
      window.frames['editFrame'].getGbInfo()
    }
    setLockCustom()
  })
}
var winType
function autoSize() {
  if (winType == 1) {
    $('.preview').hide()
    $('.editor').show()
    $('.editor .line').hide()
    $('.editor').height($(window).height() - 65)
    $('.editor .body').height($('.editor').height())
  } else if (winType == 2) {
    $('.editor').hide()
    $('.preview').show()
    $('.preview').height($(window).height() - 65)
  } else {
    $('.preview').show()
    $('.editor .line').show()
    $('.editor').show()
    var bodyHeight = $(window).height() - 65
    $('.preview').height((bodyHeight / 3) * 2)
    $('.editor').height(bodyHeight / 3)
    $('.editor .body').height($('.editor').height() - 5)
  }
  $('.mask').width($(window).width())
  $('.mask').height($(window).height())
  $('#filename').css('left', ($(window).width() - $('#filename').width()) / 2 + 80)
}
function setView(type) {
  $('.viewBut li').removeClass('current')
  $('.viewBut' + type).addClass('current')
  winType = type
  autoSize()
  $('#menuSetView1').html('编码')
  $('#menuSetView3').html('拆分')
  $('#menuSetView2').html('<i>Tab</i>预览')
  $('#menuSetView' + type).append(' ●')
  hideMenu()
  localStorage.setItem('viewType', type)
}
function showMenu(obj) {
  hideMenu()
  $(obj).addClass('current')
  $(obj).parent().find('ul').fadeIn(200)
}
function hideMenu() {
  $('.menu li ul').fadeOut(200)
  $('.fileBrowsMenu').fadeOut(200)
  $('.menu li span').removeClass('current')
}
function noHideMenu() {
  oEvent = window.event
  if (document.all) {
    oEvent.cancelBubble = true
  } else {
    oEvent.stopPropagation()
  }
}
function newJP() {
  if ($('#biaoti').val() == '') {
    alert('【错误提示】简谱的主标题必须要填写。')
    return false
  }
  var tempStr = '#============================以下为描述头定义==========================\n'
  tempStr += 'V: 1.0\n'
  tempStr += 'B: ' + $('#biaoti').val() + '\n'
  if ($('#fubiaoti').val() != '') {
    tempStr += 'B: ' + $('#fubiaoti').val() + '\n'
  }
  if ($('#zuoci').val() != '') {
    tempStr += 'Z: ' + $('#zuoci').val() + ' 词\n'
  }
  if ($('#zuoqu').val() != '') {
    tempStr += 'Z: ' + $('#zuoqu').val() + ' 曲\n'
  }
  if ($('#qitazuozhe').val() != '') {
    tempStr += 'Z: ' + $('#qitazuozhe').val() + '\n'
  }
  tempStr += 'D: ' + $('#diaoshi2').val() + $('#diaoshi1').val() + '\n'
  tempStr += 'P: ' + $('#paihao1').val() + '/' + $('#paihao2').val() + '\n'
  if ($('#jiepai').val() != '') {
    tempStr += 'J: ' + $('#jiepai').val() + '\n'
  }
  tempStr += '#============================以下开始简谱主体==========================\n'
  tempStr += 'Q: 1 2 3 4 | \n'
  tempStr += 'C: 这是歌词 \n'
  $('textarea[name=customCode]').text('')
  initPageConfig()
  localStorage.setItem('customCode', '')
  editorSetVal(tempStr)
  redraw(-1, 'newFile')
  winClose()
  setFileName('未保存')
  opernFileId = 0
}
function toClose() {
  hideMenu()
  setTimeout(function () {
    if (confirm('您确定关闭本软件吗？\n提示：当前未保存的内容可能会丢失。')) {
      window.opener = null
      window.open('', '_self')
      window.close()
    }
  }, 200)
}
function toPng() {
  return false
  hideMenu()
  winTip('导出PNG图片', 'PNG图片生成中，请稍等...')
  if (window.canvg) {
    setTimeout(function () {
      createPng()
    }, 300)
  } else {
    $.getScript('/Public/js/canvg/rgbcolor.js', function () {
      $.getScript('/Public/js/canvg/canvg.js', function () {
        setTimeout(function () {
          createPng()
        }, 300)
      })
    })
  }
}
var pngHtml
function createPng() {
  pngHtml = ''
  $('.page').each(function (index, element) {
    var svgHtml = $(element).html()
    var can = document.createElement('canvas')
    canvg(can, svgHtml, {
      renderCallback: function () {
        var datauri = can.toDataURL('image/png')
        pngHtml +=
          '<img style="border:1px #ccc solid; width:800px; height:1132px; " src="' + datauri + '">'
      },
    })
  })
  pngHtml =
    '<div style="text-align:center;"><div style="padding:10px 0 20px 0;">以下为PNG格式的图片，您可以在图片上按鼠标右键，然后选择“图片另存为...”将图片保存到您的电脑中。</div>' +
    pngHtml +
    '</div>'
  var pForm = $('#postForm')[0]
  pForm.action = '/zhipu-toPng'
  pForm.method = 'POST'
  pForm.target = '_blank'
  $('#postContent').val(pngHtml)
  pForm.submit()
  winClose()
}
function getExportName() {
  var name = $('#filename')
    .text()
    .replace(/\.jps$/i, '')
    .trim()
  name = name.replace(/[&<>:"/\\|?*\u0000-\u001f]/g, '_').replace(/[. ]+$/g, '')
  return name || '未命名'
}
function getExportSource() {
  var editorFrame = window.frames['editFrame']
  var editor = editorFrame && editorFrame.document.getElementById('editor_text')
  if (!editor) {
    throw new Error('曲谱编辑器尚未准备好，请稍后重试。')
  }
  return {
    code: editor.value,
    customCode: $('textarea[name=customCode]')
      .text()
      .replace(/<rect\b(?=[^>]*\bmask(?:=(?:"true"|'true'|true))?)[^>]*>(?:\s*<\/rect>)?/gi, ''),
    pageConfig: $('textarea[name=pageConfig]').text(),
  }
}
function getExportPages() {
  return Promise.resolve()
    .then(getExportSource)
    .then(function (source) {
      return window.openFanqieExporterReady.then(function (exporter) {
        var pages = exporter.renderPages(source.code, {
          customCode: source.customCode,
          pageConfig: source.pageConfig,
        })
        if (pages.length == 0) {
          throw new Error('当前曲谱没有可导出的页面。')
        }
        return { exporter: exporter, pages: pages }
      })
    })
}
function pageExportName(extension, pageIndex, pageCount) {
  var suffix = pageCount > 1 ? '-' + (pageIndex + 1) : ''
  return getExportName() + suffix + '.' + extension
}
function downloadBlob(blob, filename) {
  var url = URL.createObjectURL(blob)
  var link = document.createElement('a')
  link.href = url
  link.download = filename
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(function () {
    URL.revokeObjectURL(url)
  }, 1000)
}
var exportObjectUrls = []
function clearExportObjectUrls() {
  exportObjectUrls.forEach(function (url) {
    URL.revokeObjectURL(url)
  })
  exportObjectUrls = []
}
function showJpgResults(blobs) {
  clearExportObjectUrls()
  var html =
    '<div style="text-align:center; width:750px; max-height:500px; overflow:auto;"><div style="padding:10px 10px 20px;"><h3>导出的JPG图片</h3><p>点击图片即可将相应页保存到您的电脑中。</p></div>'
  blobs.forEach(function (blob, index) {
    var url = URL.createObjectURL(blob)
    exportObjectUrls.push(url)
    html +=
      '<a href="' +
      url +
      '" download="' +
      pageExportName('jpg', index, blobs.length) +
      '" style="display:block; border:0;"><img src="' +
      url +
      '" style="width:600px; max-width:90%; margin-bottom:10px; border:1px #ccc solid;"></a>'
  })
  html += '</div>'
  $('.win .titleBar span').html('导出JPG图片')
  $('.win .body').html(html)
  autoWinSize()
}
function exportFailed(title, error) {
  var message = error && error.message ? error.message : String(error)
  alert(title + '失败：' + message)
  winClose()
}
function waitForExportPaint(value) {
  return new Promise(function (resolve) {
    var schedule =
      window.requestAnimationFrame ||
      function (callback) {
        setTimeout(callback, 0)
      }
    schedule(function () {
      schedule(function () {
        resolve(value)
      })
    })
  })
}
var exportWindowSession = 0
var svgExportPages = []
var svgExportSession = 0
function beginExportWindowSession() {
  exportWindowSession++
  svgExportPages = []
  svgExportSession = 0
  return exportWindowSession
}
function isCurrentExportWindowSession(session) {
  return session == exportWindowSession
}
function toSvg() {
  hideMenu()
  var session = beginExportWindowSession()
  waitForExportPaint()
    .then(getExportPages)
    .then(function (result) {
      if (!isCurrentExportWindowSession(session)) return
      svgExportPages = result.pages
      svgExportSession = session
      var html =
        '<div style="margin:10px; width:300px;"><div style="margin-bottom:10px;">点击下方按钮，即可将相应页的SVG格式文件保存到您的电脑中。</div>'
      for (var index = 0; index < result.pages.length; index++) {
        html +=
          '<input type="button" onClick="downSvg(' +
          index +
          ')" value="导出第' +
          (index + 1) +
          '页" style="margin-right:10px; margin-bottom:5px;">'
      }
      html +=
        '<div style="margin-top:10px;"><strong>SVG格式说明：</strong>SVG是可以无限放大的矢量图格式，因此在印刷方面可以获得非常高的精度。此格式可以导入到多种印刷排版软件中。</div></div>'
      $('.win .titleBar span').html('导出SVG格式图片')
      $('.win .body').html(html)
      autoWinSize()
      $('.mask').fadeIn(300)
      $('.win').fadeIn(300)
    })
    .catch(function (error) {
      if (!isCurrentExportWindowSession(session)) return
      exportFailed('导出SVG', error)
    })
}
function downSvg(num) {
  try {
    if (!isCurrentExportWindowSession(svgExportSession)) {
      throw new Error('当前导出窗口已经失效，请重新打开。')
    }
    var svg = svgExportPages[num]
    if (!svg) throw new Error('找不到第' + (num + 1) + '页。')
    downloadBlob(
      new Blob(['<?xml version="1.0" encoding="UTF-8"?>\n', svg], {
        type: 'image/svg+xml;charset=utf-8',
      }),
      pageExportName('svg', num, svgExportPages.length),
    )
  } catch (error) {
    exportFailed('导出SVG', error)
  }
}
function exportPdf(button) {
  var session = exportWindowSession
  button.disabled = true
  button.value = '正在打开打印窗口，请稍等...'
  waitForExportPaint()
    .then(getExportPages)
    .then(function (result) {
      if (!isCurrentExportWindowSession(session)) return null
      if (typeof result.exporter.printPdf == 'function') {
        return result.exporter
          .printPdf(result.pages, {
            title: getExportName(),
          })
          .then(function () {
            return null
          })
      }
      return result.exporter.exportPdf(result.pages)
    })
    .then(function (blob) {
      if (!isCurrentExportWindowSession(session)) return
      if (blob) {
        downloadBlob(blob, getExportName() + '.pdf')
      }
      winClose()
    })
    .catch(function (error) {
      if (!isCurrentExportWindowSession(session)) return
      button.disabled = false
      button.value = '我知道了，打开打印窗口'
      exportFailed('导出PDF', error)
    })
}
function exportJpg(button) {
  var session = exportWindowSession
  var dpi = Number($('#jpgExportDpi').val()) || 96
  button.disabled = true
  button.value = 'JPG导出中，请稍等...'
  waitForExportPaint()
    .then(getExportPages)
    .then(function (result) {
      if (!isCurrentExportWindowSession(session)) return null
      return result.exporter
        .exportJpegs(result.pages, {
          scale: dpi / 96,
          dpi: dpi,
        })
        .then(function (blobs) {
          return blobs
        })
    })
    .then(function (blobs) {
      if (!blobs || !isCurrentExportWindowSession(session)) return
      showJpgResults(blobs)
    })
    .catch(function (error) {
      if (!isCurrentExportWindowSession(session)) return
      button.disabled = false
      button.value = '我知道了，导出JPG图片'
      exportFailed('导出JPG', error)
    })
}
function updateUserInfo() {
  $.post('/Zhipu-userInfo', null, function (re) {
    winClose()
    $('.userInfo').html(re)
  })
}
function toSave() {
  if (opernFileId > 0) {
    saveFile(opernFileId)
  } else {
    showWin('保存', 'Zhipu-fileBrowsing?type=save')
  }
}
function tip(strs) {
  $('#tip').html(strs)
  $('#tip').css('left', ($(window).width() - $('#tip').width()) / 2)
  $('#tip').css('top', ($(window).height() - $('#tip').height()) / 2)
  $('#tip').fadeIn(500, function () {
    setTimeout(function () {
      $('#tip').fadeOut(500)
    }, 500)
  })
}
function editorSetVal(code_) {
  window.frames['editFrame'].document.getElementById('editor_text').value = code_
  window.frames['editFrame'].formatJP()
  window.frames['editFrame'].autoSize()
  $('.preview').scrollTop(0)
  window.frames['editFrame'].updateJPcode()
}
function refreshFolderList() {
  $('.newFolderDiv').hide()
  $('.reFolderDiv').hide()
  $('.name:input').val('')
  $.get('/Zhipu-folderList', null, function (re) {
    $('.fileCateList .list').html(re)
    selectFolder(currentFolderId)
    $('.fileCateList .list ul li span')
      .bind('contextmenu', function (event) {
        if (document.all) {
          window.event.returnValue = false
        } else {
          event.preventDefault()
        }
        $('.folderMenu').css({
          top: event.clientY - $('.win').css('top').replace(/px/g, '') * 1,
          left: event.clientX - $('.win').css('left').replace(/px/g, '') * 1,
        })
        $('.folderMenu').fadeIn(200)
        $('.fileMenu').fadeOut(200)
      })
      .bind('mousedown', function (event) {
        if (event.button == 2) {
          noHideMenu()
        }
        selectFolder($(this).parent().attr('data-id'))
      })
  })
}
var currentFolderId = 0
function selectFolder(ids) {
  $('.fileCateList .current').removeClass('current')
  $('#folder_' + ids + ' .name').addClass('current')
  currentFolderId = ids
  refreshFileList()
}
function folderReName() {
  hideMenu()
  $('.reFolderDiv .id').val(currentFolderId)
  $('.reFolderDiv .name').val($('#folder_' + currentFolderId + ' .name').text())
  $('.reFolderDiv').show()
  $('.reFolderDiv .name').focus().select()
}
function folderDel() {
  hideMenu()
  setTimeout(function () {
    if (
      confirm('您确认要删除此文件夹吗？\n此操作将同时删除此文件夹里的内容，并且不可恢复。') == true
    ) {
      $('#postwin').attr('src', '/zhipu-folderDel?id=' + currentFolderId)
    }
  }, 100)
}
function folderOrder(type) {
  $('#postwin').attr('src', '/zhipu-folderOrder?type=' + type + '&id=' + currentFolderId)
}
function refreshFileList() {
  $('.folderDiv').hide()
  $.get('/Zhipu-fileList?fid=' + currentFolderId, null, function (re) {
    $('.fileList .list').html(re)
    $('.fileList .list ul li .select')
      .bind('contextmenu', function (event) {
        if (document.all) {
          window.event.returnValue = false
        } else {
          event.preventDefault()
        }
        $('.fileMenu').css({
          top: event.clientY - $('.win').css('top').replace(/px/g, '') * 1,
          left: event.clientX - $('.win').css('left').replace(/px/g, '') * 1,
        })
        $('.fileMenu').fadeIn(200)
        $('.folderMenu').fadeOut(200)
      })
      .bind('mousedown', function (event) {
        if (event.button != 2) {
          hideMenu()
        }
        noHideMenu()
        selectFile($(this).parent().attr('data-id'))
      })
      .dblclick(function () {
        if ($('#saveName').length > 0) {
          saveFile()
        } else {
          openFile()
        }
      })
  })
}
var currentFileId = 0
function selectFile(ids) {
  $('.fileList .current').removeClass('current')
  $('#file_' + ids + ' .name').addClass('current')
  currentFileId = ids
  $('.fileInfo .filename').html($('#file_' + ids + ' .name').text())
  $('#saveName').val($('#file_' + ids + ' .name').text())
}
function cancelSelectFile() {
  currentFileId = 0
  $('.fileList .current').removeClass('current')
  $('.fileInfo .filename').html('')
}
function fileDel() {
  hideMenu()
  setTimeout(function () {
    if (confirm('您确认要删除此文件吗？文件删除后不可恢复。') == true) {
      $('#postwin').attr('src', '/zhipu-fileDel?id=' + currentFileId)
    }
  }, 100)
}
function fileReName() {
  hideMenu()
  var name_ = $('#file_' + currentFileId + ' .name').text()
  $('.reFileDiv').show()
  $('.reFileDiv .id').val(currentFileId)
  $('.reFileDiv .name').val(name_)
  $('.reFileDiv .name').focus().select()
}
function fileMove() {
  hideMenu()
  $('.fileMoveDiv').show()
  $('.fileMoveDiv .id').val(currentFileId)
  $('.fileMoveDiv .fid').html('')
  $('.fileCateList .list ul li').each(function (index, element) {
    $('.fileMoveDiv .fid').append(
      "<option value='" +
        $(element).attr('data-id') +
        "'>" +
        $(element).find('.name').text() +
        '</option>',
    )
  })
}
var opernFileId = 0
function openFile() {
  if (currentFileId == 0) {
    alert('您没有选择任何文件')
    return false
  }
  winClose()
  editorSetVal('')
  winTip('载入文件', '文件正在载入中，请稍等...')
  $.getJSON('/zhipu-getFile?id=' + currentFileId, function (data) {
    opernFileId = currentFileId
    setFileName(data.name)
    $('textarea[name=customCode]').text(data.custom_code)
    localStorage.setItem('customCode', data.custom_code)
    $('textarea[name=pageConfig]').text(data.page_config)
    localStorage.setItem('pageConfig', data.page_config)
    $('#lockCustom').prop('checked', true)
    editorSetVal(data.code)
    winClose()
  })
}
function saveFile(ids) {
  if ($('#saveName').length > 0) {
    $('#saveName')[0].disabled = true
  }
  var jpcode_ = window.frames['editFrame'].document.getElementById('editor_text').value
  jpcode_ = jpcode_.replace(/\n/g, '&hh&')
  var savename_ = $('#saveName').val()
  if (savename_ == '') {
    alert('文件名不能为空')
    return false
  }
  customCode = $('textarea[name=customCode]').text()
  pageConfig = $('textarea[name=pageConfig]').text()
  $.post(
    '/Zhipu-saveFile',
    {
      code: jpcode_,
      savename: savename_,
      fid: currentFolderId,
      id: ids,
      customCode: customCode,
      pageConfig: pageConfig,
    },
    function (re) {
      arr = re.split('|')
      if (arr[0] == 'cover') {
        if (confirm('当前文件夹已存在相同文件名的文件，需要覆盖此文件吗？') == true) {
          saveFile(arr[1])
          return false
        } else {
          $('#saveName')[0].disabled = false
        }
      } else if (arr[0] == 'error') {
        alert(arr[1])
      } else {
        saveSuccess(arr[0], arr[1])
      }
    },
  )
}
function saveSuccess(id, name) {
  opernFileId = id
  setFileName(name)
  if ($('#playBut').length == 0) {
    winClose()
  }
  hideMenu()
  tip('文件保存成功！')
}
function setFileName(names) {
  $('#filename').html(names + '.jps')
  $('#filename').css('left', ($(window).width() - $('#filename').width()) / 2)
}
var exampleFileId = 0
function openExampleFile() {
  if (exampleFileId == 0) {
    alert('您没有选择任何文件')
    return false
  }
  winClose()
  editorSetVal('')
  winTip('载入文件', '文件正在载入中，请稍等...')
  $.getJSON('/Public/examples/example-' + exampleFileId + '.json', function (data) {
    opernFileId = 0
    $('textarea[name=customCode]').text(data.custom_code)
    localStorage.setItem('customCode', data.custom_code)
    $('textarea[name=pageConfig]').text(data.page_config)
    localStorage.setItem('pageConfig', data.page_config)
    $('#lockCustom').prop('checked', true)
    setFileName(data.name)
    editorSetVal(data.code)
    winClose()
  })
}
var win_drag_state = 0
function show_drag() {
  var showTable = $('.win')
  var handle = $('.win .titleBar')
  handle.find('span').css('cursor', 'move')
  handle.bind('mousedown', function (event) {
    win_drag_state = 1
    var showTop = parseInt(showTable.css('top'))
    var showLeft = parseInt(showTable.css('left'))
    var mouse_x = event.pageX
    var mouse_y = event.pageY
    $(document).bind('mousemove', function (ev) {
      if (win_drag_state == 1) {
        var _x = ev.pageX - mouse_x
        var _y = ev.pageY - mouse_y
        var nowLeft = showLeft + _x + 'px'
        var nowTop = showTop + _y + 'px'
        showTable.css({ top: nowTop, left: nowLeft })
      }
    })
  })
  $(document).bind('mouseup', function () {
    win_drag_state = 0
  })
}
function showWin(title, url, width, height) {
  var session = beginExportWindowSession()
  if ($('#playBut').length > 0) {
    stopPlay()
  }
  hideMenu()
  $('.win .titleBar span').html(title)
  $('.win .body').html('<div class="winLoad">加载中，请稍等...')
  autoWinSize()
  $('.mask').fadeIn(300)
  $('.win').fadeIn(300)
  $.get(url, null, function (data) {
    if (!isCurrentExportWindowSession(session)) return
    if (width) {
      data =
        '<div style="width:' +
        width +
        'px; height:' +
        height +
        'px; overflow:auto; margin-right:1px;">' +
        data +
        '</div>'
    }
    $('.win .body').html(data)
    autoWinSize()
  })
}
function autoWinSize() {
  var left = ($(window).width() - $('.win').width()) / 2
  var Top = ($(window).height() - $('.win').height()) / 2
  $('.win').css({ left: left, top: Top })
}
function winClose() {
  beginExportWindowSession()
  if ($('#playBut').length > 0) {
    stopPlay()
  }
  $('.win').fadeOut(300)
  $('.mask').fadeOut(300)
  clearExportObjectUrls()
}
function winTip(title, str) {
  $('.win .body').html('<div class="winLoad">' + str + '')
  $('.win .titleBar span').html(title)
  autoWinSize()
  $('.mask').fadeIn(300)
  $('.win').fadeIn(300)
}
$(document).ready(function () {
  show_drag()
})
var isfullscreen = 0
function toFullscreen() {
  hideMenu()
  setTimeout(function () {
    alert('提示：请按键盘上的“F11”键，即可进入或退出全屏模式。')
  }, 300)
  return false
  if (isfullscreen == 0) {
    fullscreen()
    isfullscreen = 1
    $('#menuFullscreen').html('<i>F11</i>退出全屏')
  } else {
    qiutFullscreen()
    isfullscreen = 0
    $('#menuFullscreen').html('<i>F11</i>全屏')
  }
}
function fullscreen() {
  var docElm = document.documentElement
  if (docElm.requestFullscreen) {
    docElm.requestFullscreen()
  } else if (docElm.mozRequestFullScreen) {
    docElm.mozRequestFullScreen()
  } else if (docElm.webkitRequestFullScreen) {
    docElm.webkitRequestFullScreen()
  } else if (elem.msRequestFullscreen) {
    elem.msRequestFullscreen()
  } else {
    alert('很抱歉，您的浏览器不支持自动全屏，请按快捷键“F11”进入全屏')
  }
}
function qiutFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen()
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen()
  } else if (document.webkitCancelFullScreen) {
    document.webkitCancelFullScreen()
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen()
  }
}
var cfDefault = new Array()
cfDefault['page'] = 'A4'
cfDefault['margin_top'] = '80'
cfDefault['margin_bottom'] = '80'
cfDefault['margin_left'] = '80'
cfDefault['margin_right'] = '80'
cfDefault['biaoti_font'] = 'Microsoft YaHei'
cfDefault['shuzi_font'] = 'b'
cfDefault['geci_font'] = 'Microsoft YaHei'
cfDefault['height_quci'] = '13'
cfDefault['height_cici'] = '10'
cfDefault['height_ciqu'] = '40'
cfDefault['height_shengbu'] = '0'
cfDefault['biaoti_size'] = '36'
cfDefault['fubiaoti_size'] = '20'
cfDefault['geci_size'] = '18'
cfDefault['body_margin_top'] = '40'
cfDefault['lianyinxian_type'] = '0'
var TCF = new Object()
function savePageConfig() {
  var tempJson = JSON.stringify(TCF)
  $('textarea[name=pageConfig]').text(tempJson)
  localStorage.setItem('pageConfig', tempJson)
  redraw(-1, 'savePageConfig')
  winClose()
}
function initPageConfig() {
  TCF.page = cfDefault['page']
  TCF.margin_top = cfDefault['margin_top']
  TCF.margin_bottom = cfDefault['margin_bottom']
  TCF.margin_left = cfDefault['margin_left']
  TCF.margin_right = cfDefault['margin_right']
  TCF.biaoti_font = cfDefault['biaoti_font']
  TCF.shuzi_font = cfDefault['shuzi_font']
  TCF.geci_font = cfDefault['geci_font']
  TCF.height_quci = cfDefault['height_quci']
  TCF.height_cici = cfDefault['height_cici']
  TCF.height_ciqu = cfDefault['height_ciqu']
  TCF.height_shengbu = cfDefault['height_shengbu']
  TCF.biaoti_size = cfDefault['biaoti_size']
  TCF.fubiaoti_size = cfDefault['fubiaoti_size']
  TCF.geci_size = cfDefault['geci_size']
  TCF.body_margin_top = cfDefault['body_margin_top']
  TCF.lianyinxian_type = cfDefault['lianyinxian_type']
  savePageConfig()
}
function pageConfigInit() {
  var jsonStr = $('textarea[name=pageConfig]').text()
  if (jsonStr != '') {
    var tempTCF = JSON.parse(jsonStr)
    if (tempTCF) {
      TCF = tempTCF
    }
  }
  if (!TCF.page) {
    TCF.page = cfDefault['page']
  }
  if (!TCF.margin_top) {
    TCF.margin_top = cfDefault['margin_top']
  }
  if (!TCF.margin_bottom) {
    TCF.margin_bottom = cfDefault['margin_bottom']
  }
  if (!TCF.margin_left) {
    TCF.margin_left = cfDefault['margin_left']
  }
  if (!TCF.margin_right) {
    TCF.margin_right = cfDefault['margin_right']
  }
  if (!TCF.biaoti_font) {
    TCF.biaoti_font = cfDefault['biaoti_font']
  }
  if (!TCF.shuzi_font) {
    TCF.shuzi_font = cfDefault['shuzi_font']
  }
  if (!TCF.geci_font) {
    TCF.geci_font = cfDefault['geci_font']
  }
  if (!TCF.height_quci) {
    TCF.height_quci = cfDefault['height_quci']
  }
  if (!TCF.height_cici) {
    TCF.height_cici = cfDefault['height_cici']
  }
  if (!TCF.height_ciqu) {
    TCF.height_ciqu = cfDefault['height_ciqu']
  }
  if (!TCF.height_shengbu) {
    TCF.height_shengbu = cfDefault['height_shengbu']
  }
  if (!TCF.biaoti_size) {
    TCF.biaoti_size = cfDefault['biaoti_size']
  }
  if (!TCF.fubiaoti_size) {
    TCF.fubiaoti_size = cfDefault['fubiaoti_size']
  }
  if (!TCF.geci_size) {
    TCF.geci_size = cfDefault['geci_size']
  }
  if (!TCF.body_margin_top) {
    TCF.body_margin_top = cfDefault['body_margin_top']
  }
  if (!TCF.lianyinxian_type) {
    TCF.lianyinxian_type = cfDefault['lianyinxian_type']
  }
  $('#cf_page').val(TCF.page)
  $('#cf_margin_top').val(TCF.margin_top)
  $('#cf_margin_bottom').val(TCF.margin_bottom)
  $('#cf_margin_left').val(TCF.margin_left)
  $('#cf_margin_right').val(TCF.margin_right)
  $('#cf_biaoti_font').val(TCF.biaoti_font)
  $('#cf_shuzi_font').val(TCF.shuzi_font)
  $('#cf_geci_font').val(TCF.geci_font)
  $('#cf_height_quci').val(TCF.height_quci)
  $('#cf_height_cici').val(TCF.height_cici)
  $('#cf_height_ciqu').val(TCF.height_ciqu)
  $('#cf_height_shengbu').val(TCF.height_shengbu)
  $('#cf_biaoti_size').val(TCF.biaoti_size)
  $('#cf_fubiaoti_size').val(TCF.fubiaoti_size)
  $('#cf_geci_size').val(TCF.geci_size)
  $('#cf_body_margin_top').val(TCF.body_margin_top)
  $('#cf_lianyinxian_type').val(TCF.lianyinxian_type)
  if (TCF.heights) {
    for (var p in TCF.heights) {
      var pNum = TCF.heights[p][0]
      $('#cf_height_page').append('<option value="' + pNum + '">第' + pNum + '页</option>')
    }
  }
}
function setHeightPage() {
  var pNum = $('#cf_height_page').val()
  if (pNum > -1) {
    var temp = TCF.heights['a' + pNum]
    $('#cf_height_quci').val(temp[1])
    $('#cf_height_cici').val(temp[2])
    $('#cf_height_ciqu').val(temp[3])
    $('#cf_height_shengbu').val(temp[4])
  } else {
    $('#cf_height_quci').val(TCF.height_quci)
    $('#cf_height_cici').val(TCF.height_cici)
    $('#cf_height_ciqu').val(TCF.height_ciqu)
    $('#cf_height_shengbu').val(TCF.height_shengbu)
  }
}
var tempHeights = new Array()
function setTempHeight() {
  var cfPageNum = $('#cf_height_page').val()
  var t1 = $('#cf_height_quci').val()
  var t2 = $('#cf_height_cici').val()
  var t3 = $('#cf_height_ciqu').val()
  var t4 = $('#cf_height_shengbu').val()
  if (cfPageNum > -1) {
    if (!TCF.heights) {
      TCF.heights = Object()
    }
    TCF.heights['a' + cfPageNum] = [cfPageNum, t1, t2, t3, t4]
  } else {
    TCF.height_quci = t1
    TCF.height_cici = t2
    TCF.height_ciqu = t3
    TCF.height_shengbu = t4
  }
}
var cf_height_pages = new Object()
function add_cf_height_page() {
  var pageNum = prompt('请输入页码：')
  if (pageNum === null) {
    return false
  }
  var r = /^[0-9]*[1-9][0-9]*$/
  if (r.test(pageNum) == false) {
    alert('页码必须是一个整数。')
    add_cf_height_page()
    return false
  }
  pageNum = pageNum * 1
  if ($('#cf_height_page option[value=' + pageNum + ']').length > 0) {
    alert('对不起，已经存在此页面的针对页。')
  } else {
    $('#cf_height_page').append("<option value='" + pageNum + "'>第" + pageNum + '页</option>')
  }
  $('#cf_height_page option')
    .sort(function (a, b) {
      var aText = $(a).attr('value') * 1
      var bText = $(b).attr('value') * 1
      if (aText > bText) return 1
      if (aText < bText) return -1
      return 0
    })
    .appendTo('#cf_height_page')
  $('#cf_height_page')
    .find('option[value=' + pageNum + ']')
    .attr('selected', true)
  setTempHeight()
}
function del_cf_height_page() {
  var pNum = $('#cf_height_page').val()
  if (pNum > -1) {
    $('#cf_height_page')
      .find('option[value=' + pNum + ']')
      .remove()
    delete TCF.heights['a' + pNum]
    setHeightPage()
  } else {
    alert('不能移除“所有页”的配置。')
  }
}
function notNum(str) {
  return isNaN(parseInt(str, 10))
}
function setJpFormat() {
  if ($('#jpFormat').prop('checked')) {
    localStorage.setItem('autoJpFormat', 'y')
  } else {
    localStorage.setItem('autoJpFormat', 'n')
  }
}
var clickCustom = 0
var clickSelect = 0
var cSelectState = 0
$(document).ready(function () {
  $(document).bind('mousemove', moveElement)
  $(document).bind('mouseup', function () {
    custom_drag_state = 0
    if (clickCustom == 0 && clickSelect == 0) {
      $('#custom defs g rect[mask]').attr({ 'stroke-width': '0' })
      $('#customAttribute').hide()
      cSelectState = 0
    }
    if (clickSelect == 1) {
      clickSelect = 0
    }
  })
  $('#customAttribute').bind('mousedown', function () {
    clickCustom = 1
    $('#customAttribute').bind('mouseup', function () {
      setTimeout(function () {
        clickCustom = 0
      }, 100)
    })
  })
  $('.preview').scroll(function () {
    updateCustomAttributePos()
  })
})
function customShortcuts(keyCode) {
  if (cSelectState == 0) {
    return true
  }
  if (keyCode == 46) {
    removeCustom()
  }
  if (keyCode == 37) {
    lightMove('x', -1)
  }
  if (keyCode == 38) {
    lightMove('y', -1)
  }
  if (keyCode == 39) {
    lightMove('x', 1)
  }
  if (keyCode == 40) {
    lightMove('y', 1)
  }
  return false
}
var selectedElement = 0
var currentX = 0
var currentY = 0
var scaleX = 1
var scaleY = 1
var custom_drag_state = 0
function addText(text, family, size, color, weight) {
  var text = $('#custom_text').val()
  var family = $('#custom_family').val()
  var size = $('#custom_size').val()
  var color = $('#custom_color').val()
  var weight = $('#custom_weight').val()
  if (text == '') {
    alert('请输入文本')
    return false
  }
  custom_code =
    '<g id="customID" data-type="text"><rect mask="true" height="10" width="10" x="-5" y="-5" stroke-width="0" fill="#ffff00"/><text x="0" y="0" fill="' +
    color +
    '" font-family="' +
    family +
    '" font-size="' +
    size +
    '" style="font-weight:' +
    weight +
    ';">' +
    text +
    '</text></g>'
  addToSvg('text', custom_code)
  winClose()
}
var lastAddSymbol = 0
function addSymbol(num) {
  hideMenu()
  if (num == 0) {
    alert('您本次运行后还未插入过自定义符号。')
    return false
  }
  lastAddSymbol = num
  var getUrl = '/Public/symbol/' + num + '.txt'
  $.get(getUrl, function (re) {
    addToSvg('path', re)
    winClose()
  })
}
function addToSvg(type, svgCode) {
  $('#addCustomTip').css('left', ($(window).width() - $('#addCustomTip').width()) / 2)
  $('#addCustomTip').fadeIn(200)
  $('svg').click(function (e) {
    svgCode =
      '<defs>' +
      svgCode +
      '</defs><use onmousedown="selectElement(this)"  style="cursor:move;" id="use_customID" x="{x}" y="{y}" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#customID"></use>'
    getScale(svgCode)
    var clickX = (e.pageX - $(this).offset().left) / scaleX - 5
    var clickY = (e.pageY - $(this).offset().top) / scaleY - 5
    var customID = randomString(10)
    svgCode = svgCode.replace('{x}', clickX)
    svgCode = svgCode.replace('{y}', clickY)
    svgCode = svgCode.replace(/customID/g, customID)
    $(this).find('#custom')[0].appendChild(parseSVG(svgCode))
    if (type == 'text') {
      var textWidth = $('#' + customID)
        .find('text')[0]
        .getComputedTextLength()
      var textHeight =
        $('#' + customID)
          .find('text')
          .attr('font-size') * 1
      $('#' + customID)
        .find('rect')
        .attr({ width: textWidth + 10, height: textHeight + 10 })
      $('#' + customID)
        .find('text')
        .attr('dy', textHeight * 0.88)
    }
    var maskObj = $('#' + customID).find('rect[mask]')
    if (lockCustomState == 1) {
      $('#use_' + customID).css('cursor', 'default')
      maskObj.attr({ x: -5555, y: -5555 })
    }
    maskObj.attr({
      'data-width': maskObj.attr('width'),
      'data-height': maskObj.attr('height'),
      opacity: 0.8,
    })
    $('#addCustomTip').fadeOut(200)
    $('#lockCustom').prop('checked', false)
    setLockCustom()
    updateCustomCode()
    $('svg').unbind('click')
  })
}
function parseSVG(s) {
  var div = document.createElementNS('http://www.w3.org/1999/xhtml', 'div')
  div.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg">' + s + '</svg>'
  var frag = document.createDocumentFragment()
  while (div.firstChild.firstChild) {
    frag.appendChild(div.firstChild.firstChild)
  }
  return frag
}
function selectElement(obj) {
  selectedElement = obj
  if (lockCustomState == 0) {
    custom_drag_state = 1
    currentX = window.event.clientX
    currentY = window.event.clientY
    var transform = $(selectedElement).attr('transform')
    if (transform) {
      getScale(transform)
    }
    var customID = $(selectedElement).attr('xlink:href')
    $('#custom defs g rect[mask]').attr({ 'stroke-width': '0' })
    $(customID + ' rect[mask]').attr({
      'stroke-width': '1',
      stroke: '#ff0000',
      'stroke-dasharray': '5,5',
    })
    showCustomAttributeDiv()
  }
  clickCustom = 1
  $(selectedElement).bind('mouseup', function () {
    setTimeout(function () {
      clickCustom = 0
    }, 100)
  })
}
function moveElement() {
  if (custom_drag_state == 1) {
    var s0bj = $(selectedElement)
    var dx = (window.event.clientX - currentX) / scaleX
    var dy = (window.event.clientY - currentY) / scaleY
    var newX = s0bj.attr('x') * 1 + dx
    var newY = s0bj.attr('y') * 1 + dy
    s0bj.attr('x', newX)
    s0bj.attr('y', newY)
    currentX = window.event.clientX
    currentY = window.event.clientY
    updateCustomAttributePos()
    updateCustomCode()
  }
}
function getScale(transform) {
  var scaleStart = transform.indexOf('scale')
  if (transform.indexOf('scale') > -1) {
    var scale = transform.substring(scaleStart + 6, transform.length)
    scale = scale.substring(0, scale.indexOf(')'))
    if (scale.indexOf(',') > -1) {
      var temArr = scale.split(',')
      scaleX = temArr[0]
      scaleY = temArr[1]
    } else {
      scaleX = scale
      scaleY = scale
    }
  } else {
    scaleX = 1
    scaleY = 1
  }
}
function randomString(len) {
  len = len || 32
  var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'
  var maxPos = $chars.length
  var pwd = ''
  for (i = 0; i < len; i++) {
    pwd += $chars.charAt(Math.floor(Math.random() * maxPos))
  }
  return 'custom_' + pwd
}
var lockCustomState = 1
function setLockCustom() {
  if ($('#lockCustom').prop('checked')) {
    $('#custom use').css('cursor', 'default')
    $('#custom defs g rect[mask]').attr({ x: -5555, y: -5555 })
    $('#custom defs g rect[mask]').attr({ 'stroke-width': '0' })
    lockCustomState = 1
  } else {
    $('#custom use').css('cursor', 'move')
    $('#custom defs g rect[mask]').attr({ x: -5, y: -5 })
    lockCustomState = 0
  }
}
function updateCustomCode() {
  var customCode = ''
  $('.page').each(function (i) {
    var pageHtml_ = $(this).html()
    var temArr = pageHtml_.split('<g id="custom">')
    var temp = temArr[1].replace('</g></svg>', '')
    customCode = customCode + temp + '[fenye]'
  })
  $('textarea[name=customCode]').text(customCode)
  localStorage.setItem('customCode', customCode)
}
function getSelectedObj() {
  return $($(selectedElement).attr('xlink:href'))
}
function showCustomAttributeDiv() {
  cSelectState = 1
  var customObj = getSelectedObj()
  var type = customObj.attr('data-type')
  $('.attributes').hide()
  $('.attributes_' + type).show()
  if (type == 'text') {
    $('#custom_text_size').val(customObj.find('text').attr('font-size'))
    $('#custom_text_family').val(customObj.find('text').attr('font-family'))
    $('#custom_text_color').val(customObj.find('text').attr('fill'))
    $('#custom_text_weight').val(customObj.find('text').css('font-weight'))
    $('#custom_text_text').val(customObj.find('text').text())
  }
  if (type == 'symbol') {
    $('#custom_symbol_fill').val(customObj.find('[fill]:eq(1)').attr('fill'))
    var scaleX = 1
    var scaleY = 1
    var transform = customObj.find('[transform]').attr('transform')
    if (transform) {
      var scaleStart = transform.indexOf('scale')
      if (transform.indexOf('scale') > -1) {
        var scale = transform.substring(scaleStart + 6, transform.length)
        scale = scale.substring(0, scale.indexOf(')'))
        if (scale.indexOf(',') > -1) {
          var temArr = scale.split(',')
          scaleX = temArr[0]
          scaleY = temArr[1]
        } else {
          scaleX = scale
          scaleY = scale
        }
      }
    }
    $('#custom_symbol_width').val(scaleX)
    $('#custom_symbol_height').val(scaleY)
  }
  updateCustomAttributePos()
  $('#customAttribute').show()
}
function updateCustomAttributePos() {
  if (cSelectState == 1) {
    var customObj = getSelectedObj()
    var svgObj_ = customObj.parents('svg')
    var top_ = svgObj_.offset().top + $(selectedElement).attr('y') * 1 - 7
    var left_ =
      svgObj_.offset().left +
      $(selectedElement).attr('x') * 1 -
      ($('#customAttribute').width() + 20)
    $('#customAttribute').css({ top: top_, left: left_ })
  }
}
function updateTextSize() {
  var customObj = getSelectedObj()
  var textWidth = customObj.find('text')[0].getComputedTextLength()
  var textHeight = customObj.find('text').attr('font-size') * 1
  customObj.find('rect').attr({ width: textWidth + 10, height: textHeight + 10 })
  customObj.find('text').attr('dy', textHeight * 0.88)
}
function lightMove(type, num) {
  var customObj = $(selectedElement)
  customObj.attr(type, customObj.attr(type) * 1 + num)
  updateCustomAttributePos()
  updateCustomCode()
}
function removeCustom() {
  if (cSelectState == 0) {
    return false
  }
  var customObj = getSelectedObj()
  $(selectedElement).remove()
  customObj.parent().remove()
  $('#customAttribute').hide()
  updateCustomCode()
  cSelectState = 0
}
$(document).ready(function () {
  $('#customAttribute select').bind('click', function () {
    clickSelect = 1
  })
  $('#customAttribute select').bind('change', function () {
    var customObj = getSelectedObj()
    var val = this.value
    var selectId = $(this).attr('id')
    switch (selectId) {
      case 'custom_text_size':
        customObj.find('text').attr('font-size', val)
        break
      case 'custom_text_family':
        customObj.find('text').attr('font-family', val)
        break
      case 'custom_text_color':
        customObj.find('text').attr('fill', val)
        break
      case 'custom_text_weight':
        customObj.find('text').css('font-weight', val)
        break
      case 'custom_symbol_fill':
        customObj.children('[mask!=true]').attr('fill', val)
        break
    }
    if (selectId.indexOf('_text_') > -1) {
      updateTextSize()
    }
    setTimeout(function () {
      clickSelect = 0
    }, 200)
    updateCustomCode()
  })
  $('#custom_text_text').bind('input', function () {
    var customObj = getSelectedObj()
    var val = this.value
    customObj.find('text').text(val)
    updateTextSize()
    updateCustomCode()
  })
  $('#custom_symbol_width,#custom_symbol_height').bind('input', function () {
    var customObj = getSelectedObj()
    var widthR = $('#custom_symbol_width').val()
    var heightR = $('#custom_symbol_height').val()
    customObj.children('[mask!=true]').attr('transform', 'scale(' + widthR + ',' + heightR + ')')
    var maskObj = customObj.children('[mask=true]')
    var newWidth = maskObj.attr('data-width') * widthR - (widthR - 1) * 10
    var newHeight = maskObj.attr('data-height') * heightR - (heightR - 1) * 10
    maskObj.attr({ width: newWidth, height: newHeight })
    updateCustomCode()
  })
})
function nobr(e) {
  var et = e || window.event
  var keycode = et.charCode || et.keyCode
  if (keycode == 13) {
    if (window.event) {
      window.event.returnValue = false
    } else {
      e.preventDefault()
    }
  }
}
;(function () {
  function r(e, n, t) {
    function o(i, f) {
      if (!n[i]) {
        if (!e[i]) {
          var c = 'function' == typeof require && require
          if (!f && c) return c(i, !0)
          if (u) return u(i, !0)
          var a = new Error("Cannot find module '" + i + "'")
          throw ((a.code = 'MODULE_NOT_FOUND'), a)
        }
        var p = (n[i] = { exports: {} })
        e[i][0].call(
          p.exports,
          function (r) {
            var n = e[i][1][r]
            return o(n || r)
          },
          p,
          p.exports,
          r,
          e,
          n,
          t,
        )
      }
      return n[i].exports
    }
    for (var u = 'function' == typeof require && require, i = 0; i < t.length; i++) o(t[i])
    return o
  }
  return r
})()(
  {
    1: [
      function (require, module, exports) {
        'use strict'
        var load = require('audio-loader')
        var player = require('sample-player')
        function instrument(ac, name, options) {
          if (arguments.length === 1)
            return function (n, o) {
              return instrument(ac, n, o)
            }
          var opts = options || {}
          var isUrl = opts.isSoundfontURL || isSoundfontURL
          var toUrl = opts.nameToUrl || nameToUrl
          var url = isUrl(name) ? name : toUrl(name, opts.soundfont, opts.format)
          return load(ac, url, { only: opts.only || opts.notes }).then(function (buffers) {
            var p = player(ac, buffers, opts).connect(
              opts.destination ? opts.destination : ac.destination,
            )
            p.url = url
            p.name = name
            return p
          })
        }
        function isSoundfontURL(name) {
          return /\.js(\?.*)?$/i.test(name)
        }
        function nameToUrl(name, sf, format) {
          return '/Public/js/audioFont/' + name + '.js?r=2'
        }
        var Soundfont = require('./legacy')
        Soundfont.instrument = instrument
        Soundfont.nameToUrl = nameToUrl
        if (typeof module === 'object' && module.exports) module.exports = Soundfont
        if (typeof window !== 'undefined') window.Soundfont = Soundfont
      },
      { './legacy': 2, 'audio-loader': 6, 'sample-player': 10 },
    ],
    2: [
      function (require, module, exports) {
        'use strict'
        var parser = require('note-parser')
        function Soundfont(ctx, nameToUrl) {
          console.warn('new Soundfont() is deprected')
          console.log('Please use Soundfont.instrument() instead of new Soundfont().instrument()')
          if (!(this instanceof Soundfont)) return new Soundfont(ctx)
          this.nameToUrl = nameToUrl || Soundfont.nameToUrl
          this.ctx = ctx
          this.instruments = {}
          this.promises = []
        }
        Soundfont.prototype.onready = function (callback) {
          console.warn('deprecated API')
          console.log(
            'Please use Promise.all(Soundfont.instrument(), Soundfont.instrument()).then() instead of new Soundfont().onready()',
          )
          Promise.all(this.promises).then(callback)
        }
        Soundfont.prototype.instrument = function (name, options) {
          console.warn('new Soundfont().instrument() is deprecated.')
          console.log('Please use Soundfont.instrument() instead.')
          var ctx = this.ctx
          name = name || 'default'
          if (name in this.instruments) return this.instruments[name]
          var inst = { name: name, play: oscillatorPlayer(ctx, options) }
          this.instruments[name] = inst
          if (name !== 'default') {
            var promise = Soundfont.instrument(ctx, name, options).then(function (instrument) {
              inst.play = instrument.play
              return inst
            })
            this.promises.push(promise)
            inst.onready = function (cb) {
              console.warn('onready is deprecated. Use Soundfont.instrument().then()')
              promise.then(cb)
            }
          } else {
            inst.onready = function (cb) {
              console.warn('onready is deprecated. Use Soundfont.instrument().then()')
              cb()
            }
          }
          return inst
        }
        function loadBuffers(ac, name, options) {
          console.warn('Soundfont.loadBuffers is deprecate.')
          console.log('Use Soundfont.instrument(..) and get buffers properties from the result.')
          return Soundfont.instrument(ac, name, options).then(function (inst) {
            return inst.buffers
          })
        }
        Soundfont.loadBuffers = loadBuffers
        function oscillatorPlayer(ctx, defaultOptions) {
          defaultOptions = defaultOptions || {}
          return function (note, time, duration, options) {
            console.warn('The oscillator player is deprecated.')
            console.log(
              'Starting with version 0.9.0 you will have to wait until the soundfont is loaded to play sounds.',
            )
            var midi = note > 0 && note < 129 ? +note : parser.midi(note)
            var freq = midi ? parser.midiToFreq(midi, 440) : null
            if (!freq) return
            duration = duration || 0.2
            options = options || {}
            var destination = options.destination || defaultOptions.destination || ctx.destination
            var vcoType = options.vcoType || defaultOptions.vcoType || 'sine'
            var gain = options.gain || defaultOptions.gain || 0.4
            var vco = ctx.createOscillator()
            vco.type = vcoType
            vco.frequency.value = freq
            var vca = ctx.createGain()
            vca.gain.value = gain
            vco.connect(vca)
            vca.connect(destination)
            vco.start(time)
            if (duration > 0) vco.stop(time + duration)
            return vco
          }
        }
        Soundfont.noteToMidi = parser.midi
        module.exports = Soundfont
      },
      { 'note-parser': 8 },
    ],
    3: [
      function (require, module, exports) {
        module.exports = ADSR
        function ADSR(audioContext) {
          var node = audioContext.createGain()
          var voltage = (node._voltage = getVoltage(audioContext))
          var value = scale(voltage)
          var startValue = scale(voltage)
          var endValue = scale(voltage)
          node._startAmount = scale(startValue)
          node._endAmount = scale(endValue)
          node._multiplier = scale(value)
          node._multiplier.connect(node)
          node._startAmount.connect(node)
          node._endAmount.connect(node)
          node.value = value.gain
          node.startValue = startValue.gain
          node.endValue = endValue.gain
          node.startValue.value = 0
          node.endValue.value = 0
          Object.defineProperties(node, props)
          return node
        }
        var props = {
          attack: { value: 0, writable: true },
          decay: { value: 0, writable: true },
          sustain: { value: 1, writable: true },
          release: { value: 0, writable: true },
          getReleaseDuration: {
            value: function () {
              return this.release
            },
          },
          start: {
            value: function (at) {
              var target = this._multiplier.gain
              var startAmount = this._startAmount.gain
              var endAmount = this._endAmount.gain
              this._voltage.start(at)
              this._decayFrom = this._decayFrom = at + this.attack
              this._startedAt = at
              var sustain = this.sustain
              target.cancelScheduledValues(at)
              startAmount.cancelScheduledValues(at)
              endAmount.cancelScheduledValues(at)
              endAmount.setValueAtTime(0, at)
              if (this.attack) {
                target.setValueAtTime(0, at)
                target.linearRampToValueAtTime(1, at + this.attack)
                startAmount.setValueAtTime(1, at)
                startAmount.linearRampToValueAtTime(0, at + this.attack)
              } else {
                target.setValueAtTime(1, at)
                startAmount.setValueAtTime(0, at)
              }
              if (this.decay) {
                target.setTargetAtTime(sustain, this._decayFrom, getTimeConstant(this.decay))
              }
            },
          },
          stop: {
            value: function (at, isTarget) {
              if (isTarget) {
                at = at - this.release
              }
              var endTime = at + this.release
              if (this.release) {
                var target = this._multiplier.gain
                var startAmount = this._startAmount.gain
                var endAmount = this._endAmount.gain
                target.cancelScheduledValues(at)
                startAmount.cancelScheduledValues(at)
                endAmount.cancelScheduledValues(at)
                var expFalloff = getTimeConstant(this.release)
                if (this.attack && at < this._decayFrom) {
                  var valueAtTime = getValue(0, 1, this._startedAt, this._decayFrom, at)
                  target.linearRampToValueAtTime(valueAtTime, at)
                  startAmount.linearRampToValueAtTime(1 - valueAtTime, at)
                  startAmount.setTargetAtTime(0, at, expFalloff)
                }
                endAmount.setTargetAtTime(1, at, expFalloff)
                target.setTargetAtTime(0, at, expFalloff)
              }
              this._voltage.stop(endTime)
              return endTime
            },
          },
          onended: {
            get: function () {
              return this._voltage.onended
            },
            set: function (value) {
              this._voltage.onended = value
            },
          },
        }
        var flat = new Float32Array([1, 1])
        function getVoltage(context) {
          var voltage = context.createBufferSource()
          var buffer = context.createBuffer(1, 2, context.sampleRate)
          buffer.getChannelData(0).set(flat)
          voltage.buffer = buffer
          voltage.loop = true
          return voltage
        }
        function scale(node) {
          var gain = node.context.createGain()
          node.connect(gain)
          return gain
        }
        function getTimeConstant(time) {
          return Math.log(time + 1) / Math.log(100)
        }
        function getValue(start, end, fromTime, toTime, at) {
          var difference = end - start
          var time = toTime - fromTime
          var truncateTime = at - fromTime
          var phase = truncateTime / time
          var value = start + phase * difference
          if (value <= start) {
            value = start
          }
          if (value >= end) {
            value = end
          }
          return value
        }
      },
      {},
    ],
    4: [
      function (require, module, exports) {
        'use strict'
        function b64ToUint6(nChr) {
          return nChr > 64 && nChr < 91
            ? nChr - 65
            : nChr > 96 && nChr < 123
              ? nChr - 71
              : nChr > 47 && nChr < 58
                ? nChr + 4
                : nChr === 43
                  ? 62
                  : nChr === 47
                    ? 63
                    : 0
        }
        function decode(sBase64, nBlocksSize) {
          var sB64Enc = sBase64.replace(/[^A-Za-z0-9\+\/]/g, '')
          var nInLen = sB64Enc.length
          var nOutLen = nBlocksSize
            ? Math.ceil(((nInLen * 3 + 1) >> 2) / nBlocksSize) * nBlocksSize
            : (nInLen * 3 + 1) >> 2
          var taBytes = new Uint8Array(nOutLen)
          for (var nMod3, nMod4, nUint24 = 0, nOutIdx = 0, nInIdx = 0; nInIdx < nInLen; nInIdx++) {
            nMod4 = nInIdx & 3
            nUint24 |= b64ToUint6(sB64Enc.charCodeAt(nInIdx)) << (18 - 6 * nMod4)
            if (nMod4 === 3 || nInLen - nInIdx === 1) {
              for (nMod3 = 0; nMod3 < 3 && nOutIdx < nOutLen; nMod3++, nOutIdx++) {
                taBytes[nOutIdx] = (nUint24 >>> ((16 >>> nMod3) & 24)) & 255
              }
              nUint24 = 0
            }
          }
          return taBytes
        }
        module.exports = { decode: decode }
      },
      {},
    ],
    5: [
      function (require, module, exports) {
        'use strict'
        module.exports = function (url, type) {
          return new Promise(function (done, reject) {
            var req = new XMLHttpRequest()
            if (type) req.responseType = type
            req.open('GET', url)
            req.onload = function () {
              req.status === 200 ? done(req.response) : reject(Error(req.statusText))
            }
            req.onerror = function () {
              reject(Error('Network Error'))
            }
            req.send()
          })
        }
      },
      {},
    ],
    6: [
      function (require, module, exports) {
        'use strict'
        var base64 = require('./base64')
        var fetch = require('./fetch')
        function fromRegex(r) {
          return function (o) {
            return typeof o === 'string' && r.test(o)
          }
        }
        function prefix(pre, name) {
          return typeof pre === 'string' ? pre + name : typeof pre === 'function' ? pre(name) : name
        }
        function load(ac, source, options, defVal) {
          var loader = isArrayBuffer(source)
            ? loadArrayBuffer
            : isAudioFileName(source)
              ? loadAudioFile
              : isPromise(source)
                ? loadPromise
                : isArray(source)
                  ? loadArrayData
                  : isObject(source)
                    ? loadObjectData
                    : isJsonFileName(source)
                      ? loadJsonFile
                      : isBase64Audio(source)
                        ? loadBase64Audio
                        : isJsFileName(source)
                          ? loadMidiJSFile
                          : null
          var opts = options || {}
          return loader
            ? loader(ac, source, opts)
            : defVal
              ? Promise.resolve(defVal)
              : Promise.reject('Source not valid (' + source + ')')
        }
        load.fetch = fetch
        function isArrayBuffer(o) {
          return o instanceof ArrayBuffer
        }
        function loadArrayBuffer(ac, array, options) {
          return new Promise(function (done, reject) {
            ac.decodeAudioData(
              array,
              function (buffer) {
                done(buffer)
              },
              function () {
                reject("Can't decode audio data (" + array.slice(0, 30) + '...)')
              },
            )
          })
        }
        var isAudioFileName = fromRegex(/\.(mp3|wav|ogg)(\?.*)?$/i)
        function loadAudioFile(ac, name, options) {
          var url = prefix(options.from, name)
          return load(ac, load.fetch(url, 'arraybuffer'), options)
        }
        function isPromise(o) {
          return o && typeof o.then === 'function'
        }
        function loadPromise(ac, promise, options) {
          return promise.then(function (value) {
            return load(ac, value, options)
          })
        }
        var isArray = Array.isArray
        function loadArrayData(ac, array, options) {
          return Promise.all(
            array.map(function (data) {
              return load(ac, data, options, data)
            }),
          )
        }
        function isObject(o) {
          return o && typeof o === 'object'
        }
        function loadObjectData(ac, obj, options) {
          var dest = {}
          var promises = Object.keys(obj).map(function (key) {
            if (options.only && options.only.indexOf(key) === -1) return null
            var value = obj[key]
            return load(ac, value, options, value).then(function (audio) {
              dest[key] = audio
            })
          })
          return Promise.all(promises).then(function () {
            return dest
          })
        }
        var isJsonFileName = fromRegex(/\.json(\?.*)?$/i)
        function loadJsonFile(ac, name, options) {
          var url = prefix(options.from, name)
          return load(ac, load.fetch(url, 'text').then(JSON.parse), options)
        }
        var isBase64Audio = fromRegex(/^data:audio/)
        function loadBase64Audio(ac, source, options) {
          var i = source.indexOf(',')
          return load(ac, base64.decode(source.slice(i + 1)).buffer, options)
        }
        var isJsFileName = fromRegex(/\.js(\?.*)?$/i)
        function loadMidiJSFile(ac, name, options) {
          var url = prefix(options.from, name)
          return load(ac, load.fetch(url, 'text').then(midiJsToJson), options)
        }
        function midiJsToJson(data) {
          var begin = data.indexOf('MIDI.Soundfont.')
          if (begin < 0) throw Error('Invalid MIDI.js Soundfont format')
          begin = data.indexOf('=', begin) + 2
          var end = data.lastIndexOf(',')
          return JSON.parse(data.slice(begin, end) + '}')
        }
        if (typeof module === 'object' && module.exports) module.exports = load
        if (typeof window !== 'undefined') window.loadAudio = load
      },
      { './base64': 4, './fetch': 5 },
    ],
    7: [
      function (require, module, exports) {
        ;(function (global) {
          ;(function (e) {
            if (typeof exports === 'object' && typeof module !== 'undefined') {
              module.exports = e()
            } else if (typeof define === 'function' && define.amd) {
              define([], e)
            } else {
              var t
              if (typeof window !== 'undefined') {
                t = window
              } else if (typeof global !== 'undefined') {
                t = global
              } else if (typeof self !== 'undefined') {
                t = self
              } else {
                t = this
              }
              t.midimessage = e()
            }
          })(function () {
            var e, t, s
            return (function o(e, t, s) {
              function a(n, i) {
                if (!t[n]) {
                  if (!e[n]) {
                    var l = typeof require == 'function' && require
                    if (!i && l) return l(n, !0)
                    if (r) return r(n, !0)
                    var h = new Error("Cannot find module '" + n + "'")
                    throw ((h.code = 'MODULE_NOT_FOUND'), h)
                  }
                  var c = (t[n] = { exports: {} })
                  e[n][0].call(
                    c.exports,
                    function (t) {
                      var s = e[n][1][t]
                      return a(s ? s : t)
                    },
                    c,
                    c.exports,
                    o,
                    e,
                    t,
                    s,
                  )
                }
                return t[n].exports
              }
              var r = typeof require == 'function' && require
              for (var n = 0; n < s.length; n++) a(s[n])
              return a
            })(
              {
                1: [
                  function (e, t, s) {
                    'use strict'
                    Object.defineProperty(s, '__esModule', { value: true })
                    s['default'] = function (e) {
                      function t(e) {
                        this._event = e
                        this._data = e.data
                        this.receivedTime = e.receivedTime
                        if (this._data && this._data.length < 2) {
                          console.warn('Illegal MIDI message of length', this._data.length)
                          return
                        }
                        this._messageCode = e.data[0] & 240
                        this.channel = e.data[0] & 15
                        switch (this._messageCode) {
                          case 128:
                            this.messageType = 'noteoff'
                            this.key = e.data[1] & 127
                            this.velocity = e.data[2] & 127
                            break
                          case 144:
                            this.messageType = 'noteon'
                            this.key = e.data[1] & 127
                            this.velocity = e.data[2] & 127
                            break
                          case 160:
                            this.messageType = 'keypressure'
                            this.key = e.data[1] & 127
                            this.pressure = e.data[2] & 127
                            break
                          case 176:
                            this.messageType = 'controlchange'
                            this.controllerNumber = e.data[1] & 127
                            this.controllerValue = e.data[2] & 127
                            if (this.controllerNumber === 120 && this.controllerValue === 0) {
                              this.channelModeMessage = 'allsoundoff'
                            } else if (this.controllerNumber === 121) {
                              this.channelModeMessage = 'resetallcontrollers'
                            } else if (this.controllerNumber === 122) {
                              if (this.controllerValue === 0) {
                                this.channelModeMessage = 'localcontroloff'
                              } else {
                                this.channelModeMessage = 'localcontrolon'
                              }
                            } else if (
                              this.controllerNumber === 123 &&
                              this.controllerValue === 0
                            ) {
                              this.channelModeMessage = 'allnotesoff'
                            } else if (
                              this.controllerNumber === 124 &&
                              this.controllerValue === 0
                            ) {
                              this.channelModeMessage = 'omnimodeoff'
                            } else if (
                              this.controllerNumber === 125 &&
                              this.controllerValue === 0
                            ) {
                              this.channelModeMessage = 'omnimodeon'
                            } else if (this.controllerNumber === 126) {
                              this.channelModeMessage = 'monomodeon'
                            } else if (this.controllerNumber === 127) {
                              this.channelModeMessage = 'polymodeon'
                            }
                            break
                          case 192:
                            this.messageType = 'programchange'
                            this.program = e.data[1]
                            break
                          case 208:
                            this.messageType = 'channelpressure'
                            this.pressure = e.data[1] & 127
                            break
                          case 224:
                            this.messageType = 'pitchbendchange'
                            var t = e.data[2] & 127
                            var s = e.data[1] & 127
                            this.pitchBend = (t << 8) + s
                            break
                        }
                      }
                      return new t(e)
                    }
                    t.exports = s['default']
                  },
                  {},
                ],
              },
              {},
              [1],
            )(1)
          })
        }).call(
          this,
          typeof global !== 'undefined'
            ? global
            : typeof self !== 'undefined'
              ? self
              : typeof window !== 'undefined'
                ? window
                : {},
        )
      },
      {},
    ],
    8: [
      function (require, module, exports) {
        !(function (t, n) {
          'object' == typeof exports && 'undefined' != typeof module
            ? n(exports)
            : 'function' == typeof define && define.amd
              ? define(['exports'], n)
              : n((t.NoteParser = t.NoteParser || {}))
        })(this, function (t) {
          'use strict'
          function n(t, n) {
            return Array(n + 1).join(t)
          }
          function r(t) {
            return 'number' == typeof t
          }
          function e(t) {
            return 'string' == typeof t
          }
          function u(t) {
            return void 0 !== t
          }
          function c(t, n) {
            return Math.pow(2, (t - 69) / 12) * (n || 440)
          }
          function o() {
            return b
          }
          function i(t, n, r) {
            if ('string' != typeof t) return null
            var e = b.exec(t)
            if (!e || (!n && e[4])) return null
            var u = {
              letter: e[1].toUpperCase(),
              acc: e[2].replace(/x/g, '##'),
            }
            ;((u.pc = u.letter + u.acc),
              (u.step = (u.letter.charCodeAt(0) + 3) % 7),
              (u.alt = 'b' === u.acc[0] ? -u.acc.length : u.acc.length))
            var o = A[u.step] + u.alt
            return (
              (u.chroma = o < 0 ? 12 + o : o % 12),
              e[3] && ((u.oct = +e[3]), (u.midi = o + 12 * (u.oct + 1)), (u.freq = c(u.midi, r))),
              n && (u.tonicOf = e[4]),
              u
            )
          }
          function f(t) {
            return r(t) ? (t < 0 ? n('b', -t) : n('#', t)) : ''
          }
          function a(t) {
            return r(t) ? '' + t : ''
          }
          function l(t, n, r) {
            return null === t || void 0 === t
              ? null
              : t.step
                ? l(t.step, t.alt, t.oct)
                : t < 0 || t > 6
                  ? null
                  : C.charAt(t) + f(n) + a(r)
          }
          function p(t) {
            if ((r(t) || e(t)) && t >= 0 && t < 128) return +t
            var n = i(t)
            return n && u(n.midi) ? n.midi : null
          }
          function s(t, n) {
            var r = p(t)
            return null === r ? null : c(r, n)
          }
          function d(t) {
            return (i(t) || {}).letter
          }
          function m(t) {
            return (i(t) || {}).acc
          }
          function h(t) {
            return (i(t) || {}).pc
          }
          function v(t) {
            return (i(t) || {}).step
          }
          function g(t) {
            return (i(t) || {}).alt
          }
          function x(t) {
            return (i(t) || {}).chroma
          }
          function y(t) {
            return (i(t) || {}).oct
          }
          var b = /^([a-gA-G])(#{1,}|b{1,}|x{1,}|)(-?\d*)\s*(.*)\s*$/,
            A = [0, 2, 4, 5, 7, 9, 11],
            C = 'CDEFGAB'
          ;((t.regex = o),
            (t.parse = i),
            (t.build = l),
            (t.midi = p),
            (t.freq = s),
            (t.letter = d),
            (t.acc = m),
            (t.pc = h),
            (t.step = v),
            (t.alt = g),
            (t.chroma = x),
            (t.oct = y))
        })
      },
      {},
    ],
    9: [
      function (require, module, exports) {
        module.exports = function (player) {
          player.on = function (event, cb) {
            if (arguments.length === 1 && typeof event === 'function')
              return player.on('event', event)
            var prop = 'on' + event
            var old = player[prop]
            player[prop] = old ? chain(old, cb) : cb
            return player
          }
          return player
        }
        function chain(fn1, fn2) {
          return function (a, b, c, d) {
            fn1(a, b, c, d)
            fn2(a, b, c, d)
          }
        }
      },
      {},
    ],
    10: [
      function (require, module, exports) {
        'use strict'
        var player = require('./player')
        var events = require('./events')
        var notes = require('./notes')
        var scheduler = require('./scheduler')
        var midi = require('./midi')
        function SamplePlayer(ac, source, options) {
          return midi(scheduler(notes(events(player(ac, source, options)))))
        }
        if (typeof module === 'object' && module.exports) module.exports = SamplePlayer
        if (typeof window !== 'undefined') window.SamplePlayer = SamplePlayer
      },
      {
        './events': 9,
        './midi': 11,
        './notes': 12,
        './player': 13,
        './scheduler': 14,
      },
    ],
    11: [
      function (require, module, exports) {
        var midimessage = require('midimessage')
        module.exports = function (player) {
          player.listenToMidi = function (input, options) {
            var started = {}
            var opts = options || {}
            var gain =
              opts.gain ||
              function (vel) {
                return vel / 127
              }
            input.onmidimessage = function (msg) {
              var mm = msg.messageType ? msg : midimessage(msg)
              if (mm.messageType === 'noteon' && mm.velocity === 0) {
                mm.messageType = 'noteoff'
              }
              if (opts.channel && mm.channel !== opts.channel) return
              switch (mm.messageType) {
                case 'noteon':
                  started[mm.key] = player.play(mm.key, 0, {
                    gain: gain(mm.velocity),
                  })
                  break
                case 'noteoff':
                  if (started[mm.key]) {
                    started[mm.key].stop()
                    delete started[mm.key]
                  }
                  break
              }
            }
            return player
          }
          return player
        }
      },
      { midimessage: 7 },
    ],
    12: [
      function (require, module, exports) {
        'use strict'
        var note = require('note-parser')
        var isMidi = function (n) {
          return n !== null && n >= 0 && n < 129
        }
        var toMidi = function (n) {
          return isMidi(n) ? +n : note.midi(n)
        }
        module.exports = function (player) {
          if (player.buffers) {
            var map = player.opts.map
            var toKey = typeof map === 'function' ? map : toMidi
            var mapper = function (name) {
              return name ? toKey(name) || name : null
            }
            player.buffers = mapBuffers(player.buffers, mapper)
            var start = player.start
            player.start = function (name, when, options) {
              var key = mapper(name)
              var dec = key % 1
              if (dec) {
                key = Math.floor(key)
                options = Object.assign(options || {}, {
                  cents: Math.floor(dec * 100),
                })
              }
              return start(key, when, options)
            }
          }
          return player
        }
        function mapBuffers(buffers, toKey) {
          return Object.keys(buffers).reduce(function (mapped, name) {
            mapped[toKey(name)] = buffers[name]
            return mapped
          }, {})
        }
      },
      { 'note-parser': 15 },
    ],
    13: [
      function (require, module, exports) {
        'use strict'
        var ADSR = require('adsr')
        var EMPTY = {}
        var DEFAULTS = {
          gain: 1,
          attack: 0.01,
          decay: 0.1,
          sustain: 0.9,
          release: 0.3,
          loop: false,
          cents: 0,
          loopStart: 0,
          loopEnd: 0,
        }
        function SamplePlayer(ac, source, options) {
          var connected = false
          var nextId = 0
          var tracked = {}
          var out = ac.createGain()
          out.gain.value = 1
          var opts = Object.assign({}, DEFAULTS, options)
          var player = { context: ac, out: out, opts: opts }
          if (source instanceof AudioBuffer) player.buffer = source
          else player.buffers = source
          player.start = function (name, when, options) {
            if (player.buffer && name !== null) return player.start(null, name, when)
            var buffer = name ? player.buffers[name] : player.buffer
            if (!buffer) {
              console.warn('Buffer ' + name + ' not found.')
              return
            } else if (!connected) {
              console.warn('SamplePlayer not connected to any node.')
              return
            }
            var opts = options || EMPTY
            when = Math.max(ac.currentTime, when || 0)
            player.emit('start', when, name, opts)
            var node = createNode(name, buffer, opts)
            node.id = track(name, node)
            node.env.start(when)
            node.source.start(when)
            player.emit('started', when, node.id, node)
            if (opts.duration) node.stop(when + opts.duration)
            return node
          }
          player.play = function (name, when, options) {
            return player.start(name, when, options)
          }
          player.stop = function (when, ids) {
            var node
            ids = ids || Object.keys(tracked)
            return ids.map(function (id) {
              node = tracked[id]
              if (!node) return null
              node.stop(when)
              return node.id
            })
          }
          player.connect = function (dest) {
            connected = true
            out.connect(dest)
            return player
          }
          player.emit = function (event, when, obj, opts) {
            if (player.onevent) player.onevent(event, when, obj, opts)
            var fn = player['on' + event]
            if (fn) fn(when, obj, opts)
          }
          return player
          function track(name, node) {
            node.id = nextId++
            tracked[node.id] = node
            node.source.onended = function () {
              var now = ac.currentTime
              node.source.disconnect()
              node.env.disconnect()
              node.disconnect()
              player.emit('ended', now, node.id, node)
            }
            return node.id
          }
          function createNode(name, buffer, options) {
            var node = ac.createGain()
            node.gain.value = 0
            node.connect(out)
            node.env = envelope(ac, options, opts)
            node.env.connect(node.gain)
            node.source = ac.createBufferSource()
            node.source.buffer = buffer
            node.source.connect(node)
            node.source.loop = options.loop || opts.loop
            node.source.playbackRate.value = centsToRate(options.cents || opts.cents)
            node.source.loopStart = options.loopStart || opts.loopStart
            node.source.loopEnd = options.loopEnd || opts.loopEnd
            node.stop = function (when) {
              var time = when || ac.currentTime
              player.emit('stop', time, name)
              var stopAt = node.env.stop(time)
              node.source.stop(stopAt)
            }
            return node
          }
        }
        function isNum(x) {
          return typeof x === 'number'
        }
        var PARAMS = ['attack', 'decay', 'sustain', 'release']
        function envelope(ac, options, opts) {
          var env = ADSR(ac)
          var adsr = options.adsr || opts.adsr
          PARAMS.forEach(function (name, i) {
            if (adsr) env[name] = adsr[i]
            else env[name] = options[name] || opts[name]
          })
          env.value.value = isNum(options.gain) ? options.gain : isNum(opts.gain) ? opts.gain : 1
          return env
        }
        function centsToRate(cents) {
          return cents ? Math.pow(2, cents / 1200) : 1
        }
        module.exports = SamplePlayer
      },
      { adsr: 3 },
    ],
    14: [
      function (require, module, exports) {
        'use strict'
        var isArr = Array.isArray
        var isObj = function (o) {
          return o && typeof o === 'object'
        }
        var OPTS = {}
        module.exports = function (player) {
          player.schedule = function (time, events) {
            var now = player.context.currentTime
            var when = time < now ? now : time
            player.emit('schedule', when, events)
            var t, o, note, opts
            return events.map(function (event) {
              if (!event) return null
              else if (isArr(event)) {
                t = event[0]
                o = event[1]
              } else {
                t = event.time
                o = event
              }
              if (isObj(o)) {
                note = o.name || o.key || o.note || o.midi || null
                opts = o
              } else {
                note = o
                opts = OPTS
              }
              return player.start(note, when + (t || 0), opts)
            })
          }
          return player
        }
      },
      {},
    ],
    15: [
      function (require, module, exports) {
        'use strict'
        var REGEX = /^([a-gA-G])(#{1,}|b{1,}|x{1,}|)(-?\d*)\s*(.*)\s*$/
        function regex() {
          return REGEX
        }
        var SEMITONES = [0, 2, 4, 5, 7, 9, 11]
        function parse(str, isTonic, tuning) {
          if (typeof str !== 'string') return null
          var m = REGEX.exec(str)
          if (!m || (!isTonic && m[4])) return null
          var p = { letter: m[1].toUpperCase(), acc: m[2].replace(/x/g, '##') }
          p.pc = p.letter + p.acc
          p.step = (p.letter.charCodeAt(0) + 3) % 7
          p.alt = p.acc[0] === 'b' ? -p.acc.length : p.acc.length
          p.chroma = SEMITONES[p.step] + p.alt
          if (m[3]) {
            p.oct = +m[3]
            p.midi = p.chroma + 12 * (p.oct + 1)
            p.freq = midiToFreq(p.midi, tuning)
          }
          if (isTonic) p.tonicOf = m[4]
          return p
        }
        function midiToFreq(midi, tuning) {
          return Math.pow(2, (midi - 69) / 12) * (tuning || 440)
        }
        var parser = { parse: parse, regex: regex, midiToFreq: midiToFreq }
        var FNS = ['letter', 'acc', 'pc', 'step', 'alt', 'chroma', 'oct', 'midi', 'freq']
        FNS.forEach(function (name) {
          parser[name] = function (src) {
            var p = parse(src)
            return p && typeof p[name] !== 'undefined' ? p[name] : null
          }
        })
        module.exports = parser
      },
      {},
    ],
  },
  {},
  [1],
)
function midiPlay() {
  this.instrument = 'gangqin'
  this.player = null
  this.instrumentState = 'loading'
  this.speed = 1
  this.addNoteTime = 0
  this.sharpNotes = {}
  this.init = function () {
    if (!this.audioCtx) {
      var AudioContext = window.AudioContext || window.webkitAudioContext || false
      this.audioCtx = new AudioContext()
      this.audioCtx.resume()
    }
    this.loadInstrument(function () {}.bind(this))
  }
  this.reset = function () {
    this.sharpNotes = {}
  }
  this.playNote = function (opt) {
    var audio = opt.note.audio
    if (audio == '0' || audio == '' || audio == '9' || audio == '8') {
      return false
    }
    if (audio == '|') {
      this.sharpNotes = {}
      return
    }
    var noteText = this.getNoteText(opt)
    var curTime = this.audioCtx.currentTime + 0.05
    this.player.play(noteText, curTime, { duration: 2 })
  }
  this.loadInstrument = function (callback) {
    if (this.instrumentState == 'loading') {
      this.instrumentState = 'loading'
      Soundfont.instrument(this.audioCtx, this.instrument, {
        gain: 1,
        attack: 0,
        decay: 0,
      }).then(
        function (piano) {
          this.player = piano
          this.instrumentState = 'ready'
          callback()
        }.bind(this),
      )
    } else {
      callback()
    }
  }
  this.getNoteText = function (opt) {
    var noteText = ''
    var code = opt.note.code
    var audio = opt.note.audio
    var playTune = opt.playTune
    var playNum = audio.substring(0, 1)
    if (code.includes('=')) {
      delete this.sharpNotes[playNum]
    }
    if (this.sharpNotes[playNum]) {
      audio = this.sharpNotes[playNum]
    } else {
      if (code.includes('#') || code.includes('$')) {
        if (code.includes('#')) {
          audio += '#'
        }
        if (code.includes('$')) {
          audio = audio.replace(playNum, playNum - 1) + '#'
        }
        this.sharpNotes[playNum] = audio
      }
    }
    const audioToNoteMap = {
      '1,,': 'C2',
      '1,,#': 'Db2',
      '2,,': 'D2',
      '2,,#': 'Eb2',
      '3,,': 'E2',
      '3,,#': 'F2',
      '4,,': 'F2',
      '4,,#': 'Gb2',
      '5,,': 'G2',
      '5,,#': 'Ab2',
      '6,,': 'A2',
      '6,,#': 'Bb2',
      '7,,': 'B2',
      '7,,#': 'C3',
      '1,': 'C3',
      '1,#': 'Db3',
      '2,': 'D3',
      '2,#': 'Eb3',
      '3,': 'E3',
      '3,#': 'F3',
      '4,': 'F3',
      '4,#': 'Gb3',
      '5,': 'G3',
      '5,#': 'Ab3',
      '6,': 'A3',
      '6,#': 'Bb3',
      '7,': 'B3',
      '7,#': 'C4',
      1: 'C4',
      '1#': 'Db4',
      2: 'D4',
      '2#': 'Eb4',
      3: 'E4',
      '3#': 'F4',
      4: 'F4',
      '4#': 'Gb4',
      5: 'G4',
      '5#': 'Ab4',
      6: 'A4',
      '6#': 'Bb4',
      7: 'B4',
      '7#': 'C5',
      "1'": 'C5',
      "1'#": 'Db5',
      "2'": 'D5',
      "2'#": 'Eb5',
      "3'": 'E5',
      "3'#": 'F5',
      "4'": 'F5',
      "4'#": 'Gb5',
      "5'": 'G5',
      "5'#": 'Ab5',
      "6'": 'A5',
      "6'#": 'Bb5',
      "7'": 'B5',
      "7'#": 'C6',
      "1''": 'C6',
      "1''#": 'Db6',
      "2''": 'D6',
      "2''#": 'Eb6',
      "3''": 'E6',
      "3''#": 'F6',
      "4''": 'F6',
      "4''#": 'Gb6',
      "5''": 'G6',
      "5''#": 'Ab6',
      "6''": 'A6',
      "6''#": 'Bb6',
      "7''": 'B6',
    }
    noteText = audioToNoteMap[audio] || 'none'
    noteText = this.transposeNote(noteText, 'C', playTune)
    return noteText
  }
  this.transposeNote = function (noteText, oldTune, playTune) {
    const noteValues = {
      C2: 0,
      'C#2': 1,
      Db2: 1,
      D2: 2,
      'D#2': 3,
      Eb2: 3,
      E2: 4,
      F2: 5,
      'F#2': 6,
      Gb2: 6,
      G2: 7,
      'G#2': 8,
      Ab2: 8,
      A2: 9,
      'A#2': 10,
      Bb2: 10,
      B2: 11,
      C3: 12,
      'C#3': 13,
      Db3: 13,
      D3: 14,
      'D#3': 15,
      Eb3: 15,
      E3: 16,
      F3: 17,
      'F#3': 18,
      Gb3: 18,
      G3: 19,
      'G#3': 20,
      Ab3: 20,
      A3: 21,
      'A#3': 22,
      Bb3: 22,
      B3: 23,
      C4: 24,
      'C#4': 25,
      Db4: 25,
      D4: 26,
      'D#4': 27,
      Eb4: 27,
      E4: 28,
      F4: 29,
      'F#4': 30,
      Gb4: 30,
      G4: 31,
      'G#4': 32,
      Ab4: 32,
      A4: 33,
      'A#4': 34,
      Bb4: 34,
      B4: 35,
      C5: 36,
      'C#5': 37,
      Db5: 37,
      D5: 38,
      'D#5': 39,
      Eb5: 39,
      E5: 40,
      F5: 41,
      'F#5': 42,
      Gb5: 42,
      G5: 43,
      'G#5': 44,
      Ab5: 44,
      A5: 45,
      'A#5': 46,
      Bb5: 46,
      B5: 47,
      C6: 48,
      'C#6': 49,
      Db6: 49,
      D6: 50,
      'D#6': 51,
      Eb6: 51,
      E6: 52,
      F6: 53,
      'F#6': 54,
      Gb6: 54,
      G6: 55,
      'G#6': 56,
      Ab6: 56,
      A6: 57,
      'A#6': 58,
      Bb6: 58,
      B6: 59,
    }
    function getTuneValue(tune) {
      const tuneValues = 'C C# D D# E F F# G G# A A# B'.split(' ')
      return tuneValues.indexOf(tune.toUpperCase()) % 12
    }
    function getNoteByValue(value) {
      for (let note in noteValues) {
        if (noteValues[note] === value) {
          return note
        }
      }
      return '0'
    }
    const originalValue = noteValues[noteText]
    const oldTuneValue = getTuneValue(oldTune)
    const playTuneValue = getTuneValue(playTune)
    const transposedValue = originalValue + playTuneValue - oldTuneValue
    const newNote = getNoteByValue(transposedValue)
    return newNote
  }
  return this
}
var midiPlay = new midiPlay()
var countTime = 0,
  currentPlay = 0,
  playInterval
var plays = new Array()
var xunhuan = new Array()
var playTune = 60
var playState = 0
function toPlay() {
  if (playState != 1) {
    var jpcode = window.frames['editFrame'].document.getElementById('editor_text').value
    if (jpcode.indexOf('Q2') > -1 || jpcode.indexOf('{bz') > -1 || jpcode.indexOf('{dsb') > -1) {
      alert('很抱歉，程序目前不支持包含多声部的简谱试听。')
      return false
    }
    playTune = $('svg use[data-diaohao]').attr('code')
    if (!playTune) {
      playTune = 'C'
    }
    playAll()
    playState = 1
    $('#playBut').val('暂停')
    $('#speed')[0].disabled = true
    $('#adjust')[0].disabled = true
    $('#hulvFanfu')[0].disabled = true
  } else {
    pausePlay()
    playState = 2
    $('#playBut').val('播放')
  }
}
function stopPlay() {
  countTime = 0
  currentPlay = 0
  plays = []
  againState = []
  fanfuNum = 1
  datiaoyueNum = 1
  clearInterval(playInterval)
  playState = 0
  $('#playBut').val('播放')
  $('#speed')[0].disabled = false
  $('#adjust')[0].disabled = false
  $('#hulvFanfu')[0].disabled = false
  $('#playerLine').hide()
}
function pausePlay() {
  clearInterval(playInterval)
}
var topPY, leftPY, Pindex
var fanfuNum = 1,
  datiaoyueNum = 1,
  zIndex,
  lastHS = 0,
  tyNum = 0,
  lastTy = 0
var tiaofangziWeiJieShu = ['', '']
function playAll() {
  midiPlay.reset()
  if (plays.length == 0) {
    zIndex = 0
    firstKuohu = true
    topPY = 55 - $('.preview').scrollTop() + 10
    leftPY = $('#page_0').offset().left
    $('svg use[time]').each(function (index, element) {
      var time = Math.round($(element).attr('time') * $('#speed').val() * $('#adjust').val())
      nextObj = $('svg use[time]:eq(' + (index + 1) + ')')
      gotos = new Array()
      var nextCode = nextObj.attr('code')
      if (nextCode) {
        if (nextCode.indexOf('|y') != -1 || nextCode.indexOf('|l') != -1) {
          gotos.push(['fanfu', zIndex, ''])
        }
        if (nextCode.indexOf('|z') != -1 || nextCode.indexOf('|l') != -1) {
          zIndex = index + 2
        }
        if (nextCode.indexOf('&hs') != -1) {
          lastHS = index + 2
        }
        if (nextCode.indexOf('&ds') != -1) {
          gotos.push(['dafanfu', lastHS, ''])
        }
        if (nextCode.indexOf(']') != -1) {
          if (nextCode.indexOf(']/') != -1) {
            tiaofangziWeiJieShu = [lastFangZiStart, lastFangZiCode]
          } else {
            plays[lastFangZiStart][4].push(['tiaofangzi', index + 1, lastFangZiCode])
          }
        }
        if (nextCode.indexOf('[') != -1) {
          lastFangZiStart = index + 1
          lastFangZiCode = $('svg use[time]:eq(' + (index + 1) + ')').attr('code')
          if (tiaofangziWeiJieShu[0] !== '') {
            plays[tiaofangziWeiJieShu[0]][4].push(['tiaofangzi', index + 1, tiaofangziWeiJieShu[1]])
            tiaofangziWeiJieShu = ['', '']
          }
        }
        next2Obj = $('svg use[time]:eq(' + (index + 2) + ')')
        if (next2Obj.length == 0) {
          if (tiaofangziWeiJieShu[0] !== '') {
            plays[tiaofangziWeiJieShu[0]][4].push(['tiaofangzi', index + 1, tiaofangziWeiJieShu[1]])
            tiaofangziWeiJieShu = ['', '']
          }
        }
        if (nextObj.attr('code').indexOf('&ty') != -1) {
          tyNum++
          if (tyNum == 2) {
            plays[lastTy][4].push(['datiaoyue', index + 1, ''])
            tyNum = 0
          } else {
            lastTy = index
          }
        }
        if (nextObj.attr('code').indexOf('&dc') != -1) {
          gotos.push(['dc', 0, ''])
        }
        if (nextObj.attr('code').indexOf('&fine') != -1) {
          gotos.push(['fine', '', ''])
        }
      }
      plays[index] = [
        time,
        $(element).attr('audio'),
        $(element).offset().top - topPY,
        $(element).offset().left - leftPY,
        gotos,
        $(element).attr('code'),
      ]
      $(element).attr('data-pIndex', index)
      $(element).click(function (e) {
        if (playState != 0) {
          currentPlay = $(this).attr('data-pIndex') * 1
          $('#playerLine').css({
            'margin-top': plays[index][2] - 4,
            'margin-left': plays[index][3] - 4,
            display: 'block',
          })
        }
      })
    })
  }
  playInterval = setTimeout(playIntervalFun, 10)
}
var againState = new Array()
function playIntervalFun() {
  if (plays.hasOwnProperty(currentPlay)) {
    var note = plays[currentPlay]
    if (note[1] != '') {
      if ($('#playAutoRoll').attr('checked')) {
        if (
          $('.preview').scrollTop() + $('.preview').height() - 55 < note[2] + 20 ||
          $('.preview').scrollTop() > note[2] - 20
        ) {
          $('.preview').animate({ scrollTop: note[2] - 50 }, 1000)
        }
      }
      midiPlay.playNote({ note: { audio: note[1], code: note[5] }, playTune })
      $('#playerLine').css({
        'margin-top': note[2] - 4,
        'margin-left': note[3] - 4,
        display: 'block',
      })
    } else if (note[5].indexOf('|') != -1) {
      midiPlay.playNote({ note: { audio: '|', code: '|' }, playTune })
    }
    if (note[4].length > 0 && document.getElementById('hulvFanfu').checked == false) {
      for (var i = 0; i < note[4].length; i++) {
        if (note[4][i][0] !== '') {
          type = note[4][i][0]
          toIndex = note[4][i][1]
          qita = note[4][i][2]
          if (type == 'fanfu') {
            if (!againState[currentPlay]) {
              againState[currentPlay] = true
              currentPlay = toIndex - 1
              fanfuNum++
              break
            } else if (againState[currentPlay] == true) {
              fanfuNum = 1
            }
          }
          if (type == 'tiaofangzi') {
            if (toIndex !== '') {
              if (qita.indexOf(fanfuNum) == -1) {
                jumpObj = plays[toIndex - 1]
                if (jumpObj[4].length > 0) {
                  for (var x = 0; x < note[4].length; x++) {
                    if (jumpObj[4][x][1] !== '') {
                      if (
                        jumpObj[4][x][2].indexOf(fanfuNum) == -1 &&
                        jumpObj[4][x][2].indexOf(':|') != -1
                      ) {
                        currentPlay = jumpObj[4][x][1]
                      } else {
                        currentPlay = toIndex
                      }
                    } else {
                      currentPlay = toIndex
                    }
                  }
                } else {
                  currentPlay = toIndex
                }
                break
              }
            }
          }
          if (type == 'dafanfu') {
            if (!againState[currentPlay]) {
              againState = []
              againState[currentPlay] = true
              currentPlay = toIndex - 1
              fanfuNum = 1
              datiaoyueNum++
              break
            }
          }
          if (type == 'datiaoyue') {
            if (datiaoyueNum > 1) {
              currentPlay = toIndex - 1
              break
            }
          }
          if (type == 'dc') {
            if (!againState[currentPlay]) {
              againState = []
              againState[currentPlay] = true
              currentPlay = toIndex - 1
              fanfuNum = 1
              datiaoyueNum++
              break
            }
          }
          if (type == 'fine') {
            if (datiaoyueNum > 1) {
              setTimeout(function () {
                stopPlay()
              }, 1000)
              return false
            }
          }
        }
      }
    }
    currentPlay++
    currentObj = $('svg use[time]:eq(' + (currentPlay - 1) + ')')
    if (currentObj.length > 0) {
      currentCode = currentObj.attr('code')
      if (currentCode.indexOf('[') != -1) {
        if (currentCode.indexOf('1') != -1) {
          fanfuNum = 1
        }
        if (currentCode.indexOf('2') != -1) {
          fanfuNum = 2
        }
        if (currentCode.indexOf('3') != -1) {
          fanfuNum = 3
        }
        if (currentCode.indexOf('4') != -1) {
          fanfuNum = 4
        }
      }
    }
    if (plays.hasOwnProperty(currentPlay)) {
      playInterval = setTimeout(playIntervalFun, note[0])
    } else {
      setTimeout(function () {
        stopPlay()
      }, 1000)
    }
  }
}
