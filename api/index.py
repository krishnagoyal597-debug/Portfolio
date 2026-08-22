import os
import sys

# Add server directory to Python path so modules in server/ can be resolved seamlessly
current_dir = os.path.dirname(os.path.abspath(__file__))
server_dir = os.path.normpath(os.path.join(current_dir, "../server"))
if server_dir not in sys.path:
    sys.path.insert(0, server_dir)

from app import app
