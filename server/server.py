import asyncio
import websockets
import redis
import json
import uuid
import bcrypt


redis_client = redis.Redis(host="kvs")



class Task(object):
    # See template/create.json
    CREATE_POD = "CREATE_POD"


def detect_task(msg: str):
    node = json.loads(msg)
    task = node['task']

    if task == 'CREATE_POD':
        return Task.CREATE_POD


def create_pod() -> (str, str):
    """Create and regist Pod in redis.
    SET pod_id hashed_password
    """
    flag = False
    password = str(uuid.uuid4())

    # encrypt
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password.encode(), salt)

    while not flag:
        pod_id = str(uuid.uuid4())
        flag = redis_client.setnx(pod_id, hashed_password)
    
    return pod_id, password
    


async def handler(sock, path):
    data = await sock.recv()
    task = detect_task(data)

    if task == Task.CREATE_POD:
        pod_id, password = create_pod()
        resp = json.dumps({"pod_id": pod_id, "password": password})
    
    await sock.send(resp)


start_server = websockets.serve(handler, port=8765)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
