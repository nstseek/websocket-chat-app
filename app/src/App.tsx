import {
  MutableRefObject,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import config from "../../config";
import "./App.css";

type Props = { wsConnection: WebSocket };

function MessageList({ wsConnection }: Props) {
  const [messagesList, setMessagesList] = useState<
    [timestamp: number, message: string][]
  >([]);
  const messagesBoxRef = useRef() as MutableRefObject<HTMLDivElement | null>;

  useEffect(() => {
    wsConnection.onmessage = (event) => {
      setMessagesList(JSON.parse(event.data));
    };
  }, [setMessagesList]);

  useLayoutEffect(() => {
    messagesBoxRef.current?.scrollTo({
      behavior: "instant",
      left: 0,
      top: messagesBoxRef.current.scrollHeight,
    });
  });

  return (
    <div className="messages" ref={messagesBoxRef}>
      {messagesList.map(([timestamp, message]) => (
        <div className="message" key={timestamp}>
          <span className="timestamp">
            [{new Date(timestamp).toUTCString()}]
          </span>

          <span>{message}</span>
        </div>
      ))}
    </div>
  );
}

function Form({ wsConnection }: Props) {
  const [inputValue, setInputValue] = useState("");

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        wsConnection.send(inputValue);
        setInputValue("");
      }}
    >
      <input
        value={inputValue}
        onChange={(event) => setInputValue(event.target.value)}
        placeholder="Type your message here"
      />
      <button type="submit">Send message</button>
    </form>
  );
}

function App() {
  const wsConnection = useMemo(
    () => new WebSocket(`ws://localhost:${config.serverPort}`),
    []
  );

  return (
    <>
      <h1>Websocket chat app</h1>
      <div className="card">
        <MessageList wsConnection={wsConnection} />
        <Form wsConnection={wsConnection} />
      </div>
    </>
  );
}

export default App;
