import re

with open('src/components/nodes/OutcomeNode.tsx', 'r') as f:
    content = f.read()

# Let's make sure the OutcomeNode properly sets the initial data to its internal state
content = content.replace("const [outcome, setOutcome] = useState<string>((data.outcome as string) || 'Ending Name');",
                          "const [outcome, setOutcome] = useState<string>((data.outcome as string) || '');")
content = content.replace("placeholder=\"Ending Name\"", "placeholder=\"Ending Name\"")

with open('src/components/nodes/OutcomeNode.tsx', 'w') as f:
    f.write(content)
