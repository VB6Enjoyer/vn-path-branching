with open('src/components/Editor.tsx', 'r') as f:
    content = f.read()

# I see what happened. My regex replacement for onExport duplicated it poorly!
#    681	    downloadAnchorNode.click();
#    682	    downloadAnchorNode.remove();
#    683	  };
#    684	    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(saveObj, null, 2));
# ...

bad_block = """  };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(saveObj, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "brain-map-flow.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };"""

content = content.replace(bad_block, "  };")

with open('src/components/Editor.tsx', 'w') as f:
    f.write(content)
