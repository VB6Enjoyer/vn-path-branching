with open('/home/jules/verification/verify_flow_browser.py', 'r') as f:
    content = f.read()

# Instead of searching for "example-flow", let's search for "Untitled Flow" or whatever it is called.
# Since `example-flow.json` does not have metadata, its title defaults to "Untitled Flow".
content = content.replace('.fill("example-flow")', '.fill("Untitled Flow")')

with open('/home/jules/verification/verify_flow_browser.py', 'w') as f:
    f.write(content)
