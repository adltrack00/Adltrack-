"""Only public marketing routes resolve to the standalone marketing documents."""
import os

ROUTES = frozenset(['','for-companies','for-vendors','for-riders','how-it-works','ada','whatsapp','proof-of-delivery','pricing','questions','book-a-demo','demo','privacy'])

def marketing_file(root, path):
    route = path.strip('/')
    if route not in ROUTES:
        return None
    file = os.path.join(root, 'marketing', route, 'index.html')
    return file if os.path.isfile(file) else None
