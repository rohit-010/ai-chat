import { useState } from 'react';
import Title from './Title';
import RecordMessage from './RecordMessage';
import axios from 'axios';

const BACKEND_API_CALL = 'https://ai-chat-node-backend.onrender.com/post-audio';

function Controller() {
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);

  const createBlobUrl = (data: any) => {
    const blob = new Blob([data], { type: 'audio/mpeg' });
    // const blob = new Blob([data], { type: 'audio/flac' });
    const url = window.URL.createObjectURL(blob);
    return url;
  };

  const handleStop = async (blobUrl: string) => {
    setIsLoading(true);

    // Append recorded message to messages
    const myMessage = { sender: 'me', blobUrl };
    const messagesArr = [...messages, myMessage];

    // Convert blob url to blob object
    fetch(blobUrl)
      .then((res) => res.blob())
      .then(async (blob) => {
        console.log('blob ', blob);
        if (blob.size > 0) {
          //Construct audio to send file
          const formData = new FormData();
          formData.append('file', blob, 'myFile.wav');

          // Send form data to api endpoint
          axios
            .post(BACKEND_API_CALL, formData, {
              headers: {
                'Content-Type': 'audio.mpeg',
              },
              responseType: 'arraybuffer',
            })
            .then((res: any) => {
              console.log(' response from backend', res);
              const blob = res.data;
              console.log(' client converted blob', blob);
              const audio = new Audio();
              console.log(' client converted audio', audio);
              audio.src = createBlobUrl(blob);
              console.log(' client converted blob url', audio.src);

              //Append to audio
              const rachelMessage = { sender: 'rachel', blobUrl: audio.src };
              messagesArr.push(rachelMessage);
              setMessages(messagesArr);

              // Play Audio
              setIsLoading(false);
              audio.play();
            })
            .catch((err) => {
              console.error(err.message);
              setIsLoading(false);
            });
        }
      });
  };

  return (
    <div className="h-screen overflow-y-hidden">
      <Title setMessages={setMessages} />
      <div className="flex flex-col justify-between h-full overflow-y-scroll pb-96">
        {/* Conversation */}
        <div className="mt-5 px-5">
          {messages.map((audio, index) => {
            return (
              <div
                key={index + audio.sender}
                className={
                  'flex flex-col ' +
                  (audio.sender == 'rachel' && 'flex items-end')
                }
              >
                {/* Sender */}
                <div className="mt-4">
                  <p
                    className={
                      audio.sender == 'rachel'
                        ? 'text-right mr-2 italic text-green-500'
                        : 'ml-2 italic text-blue-500'
                    }
                  >
                    {audio.sender}
                  </p>
                  {/* Audio Message */}
                  <audio
                    src={audio.blobUrl}
                    className="appearance-none "
                    controls
                  />
                </div>
              </div>
            );
          })}
          {messages.length == 0 && !isLoading && (
            <div className="text-center font-light italic mt-10">
              Send Rachel a message ...
            </div>
          )}

          {isLoading && (
            <div className="text-center font-light italic mt-10 animate">
              Gimme a few seconds ...
            </div>
          )}
        </div>
        {/* Recorder */}
        <div className="fixed bottom-0 w-full py-6 border-t text-center bg-gradient-to-r from-violet-500 to-pink-500">
          <div className="flex justify-center items-center w-full">
            <RecordMessage handleStop={handleStop} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Controller;
