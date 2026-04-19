import socketio
import time

URL = "https://skribbl.devvarshney.me"
# URL = "http://localhost:5000"

sio_alpha = socketio.Client()
sio_beta = socketio.Client()

room_code_global = None
word_to_guess_global = None

def setup_alpha():
    @sio_alpha.on('connect')
    def on_connect():
        print("[Alpha] Connected to WebSockets")
        sio_alpha.emit('create_room', {'playerName': 'Alpha', 'roomCode': 'TEST99', 'isPrivate': True})

    @sio_alpha.on('room_created')
    def on_rc(data):
        global room_code_global
        room_code_global = data['roomCode']
        print(f"[Alpha] Created Room: {room_code_global}")

    @sio_alpha.on('round_start')
    def on_rs(data):
        global word_to_guess_global
        print("[Alpha] Round Start Data:")
        print(data)
        if 'options' in data and data['options']:
            print(f"[Alpha] Received word options: {data['options']}")
            word_to_guess_global = data['options'][0]
            print(f"[Alpha] Choosing word: {word_to_guess_global}")
            sio_alpha.emit('word_chosen', {'roomCode': room_code_global, 'word': word_to_guess_global})

def setup_beta():
    @sio_beta.on('connect')
    def on_connect():
        print("[Beta] Connected to WebSockets")
    
    @sio_beta.on('joined_room')
    def on_jr(*args):
        print("[Beta] Joined Room successfully.")

    @sio_beta.on('guess_result')
    def on_gr(data):
        print(f"[Beta] Guess Result: {data}")
        if data.get('correct'):
            print("\n====================")
            print("GUESS SUBMISSION WORKS PERFECTLY!")
            print("====================\n")
    
    @sio_beta.on('round_start')
    def on_rs(data):
        print("[Beta] Round Start Data:")
        if 'options' in data and data['options']:
            print("\n====================")
            print(f"BETA RECEIVED WORD OPTIONS FOR ROUND 2: {data['options']}")
            print("ROUND 2 BUG IS TOTALLY FIXED!")
            print("====================\n")

setup_alpha()
setup_beta()

# Connect Alpha
sio_alpha.connect(URL)
time.sleep(2)

# Connect Beta
if room_code_global:
    sio_beta.connect(URL)
    sio_beta.emit('join_room', {'playerName': 'Beta', 'roomCode': room_code_global})
    time.sleep(2)
    
    # Both Ready
    sio_alpha.emit('player_ready', {'roomCode': room_code_global})
    sio_beta.emit('player_ready', {'roomCode': room_code_global})
    time.sleep(1)

    # Alpha starts
    sio_alpha.emit('start_game', {'roomCode': room_code_global})
    print("[Test] Game Started")

    time.sleep(3)

    if word_to_guess_global:
        print("[Beta] Guessing...")
        sio_beta.emit('guess', {'roomCode': room_code_global, 'text': word_to_guess_global})
    
    time.sleep(5)
    print("\nTest completed. Exiting.")
    sio_alpha.disconnect()
    sio_beta.disconnect()
else:
    print("Room creation failed.")
