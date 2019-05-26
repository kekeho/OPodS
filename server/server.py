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
    JOIN_POD = "JOIN_POD"
    UNKNOWN = "UNKNOWN"


def detect_task(msg: str):
    node = json.loads(msg)
    task = node['task']

    if task == 'CREATE_POD':
        return Task.CREATE_POD
    elif task == 'JOIN_POD':
        return Task.JOIN_POD
    else:
        return Task.UNKNOWN


async def create_pod() -> (str, str):
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


async def check_password(pod_id: str, password: str) -> bool:
    hashed_pw = redis_client.get(pod_id)
    # pod name is wrong.
    if hashed_pw is None:
        return False
    
    return bcrypt.checkpw(password.encode(), hashed_pw)


async def handler(sock, path):
    data = await sock.recv()
    datanode = json.loads(data)
    task = detect_task(data)

    if task == Task.CREATE_POD:
        pod_id, password = await create_pod()
        resp = json.dumps({'pod_id': pod_id, 'password': password})
    
    elif task == Task.JOIN_POD:
        pod_id = datanode['pod_id']
        password = datanode['password']
        if await check_password(pod_id, password):
            resp = json.dumps({'result': 'ACCEPTED'})
        else:
            resp = json.dumps({'result': 'CANCEL'})

    
    await sock.send(resp)


start_server = websockets.serve(handler, port=8765)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
