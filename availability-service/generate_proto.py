import subprocess
import sys
import os

os.makedirs("generated", exist_ok=True)

subprocess.run([
    sys.executable, "-m", "grpc_tools.protoc",
    "-I./proto",
    "--python_out=./generated",
    "--grpc_python_out=./generated",
    "./proto/availability.proto"
], check=True)

# Popravi import v generated fajlu (relativni import)
grpc_file = "generated/availability_pb2_grpc.py"
with open(grpc_file, "r") as f:
    content = f.read()
content = content.replace("import availability_pb2", "from generated import availability_pb2")
with open(grpc_file, "w") as f:
    f.write(content)

print("Proto files generated successfully!")