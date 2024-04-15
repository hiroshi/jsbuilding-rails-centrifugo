import { createRoot } from "react-dom/client";
import React, {
  useEffect,
  useState,
  useRef,
  useContext,
  createContext,
} from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Link,
  useParams,
} from "react-router-dom";
import { Centrifuge } from "centrifuge";

const AppContext = createContext(null);

function UserImage({ user }) {
  return <img src={user.image_url} width="18" title={user.email} />;
}

function NewTopic({ room }) {
  // console.log({ room });
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const message = inputRef.current.value;
    fetch(`/api/rooms/${room._id}/topics`, {
      method: "POST",
      headers: {
        "X-CSRF-Token": document
          .querySelector("meta[name=csrf-token]")
          .getAttribute("content"),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ topic: { message } }),
    }).then((res) => {
      console.log({ res });
      e.target.reset();
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input ref={inputRef} type="text" placeholder="New topic" />
    </form>
  );
}

function Topics({ room }) {
  const limit = 5;
  const [topics, setTopics] = useState([]);
  const { centrifuge } = useContext(AppContext);

  useEffect(() => {
    if (!centrifuge) return;
    console.log({ room });
    const sub = centrifuge.newSubscription(`/rooms/${room._id}/topics`);
    // console.log({sub});
    sub
      .on("publication", function (ctx) {
        console.log('publication:', { ctx });
        setTopics((a) => [ctx.data.topic, ...a.slice(0, limit - 1)]);
      })
      .on("subscribing", function (ctx) {
        console.log("subscribing:", { ctx });
      })
      .on("subscribed", function (ctx) {
        console.log("subscribed:", { ctx });
      })
      .on("unsubscribed", function (ctx) {
        console.log("unsubscribed:", { ctx });
      })
      .subscribe();

    return () => centrifuge.removeSubscription(sub);
  }, [centrifuge]);

  useEffect(() => {
    fetch(`/api/rooms/${room._id}/topics?limit=${limit}`)
      .then((res) => res.json())
      .then((topics) => {
        setTopics(topics);
      });
  }, []);

  const lists = topics.map((topic) => {
    const comments_count =
      topic.comments_count > 0 && `(${topic.comments_count})`;
    return (
      <li key={topic._id}>
        {topic.user && <UserImage user={topic.user} />}&nbsp;
        <Link to={`/topics/${topic._id}`}>{topic.message}</Link>
        {comments_count}
      </li>
    );
  });

  return (
    <>
      <ul>
        <li key="new">
          <NewTopic {...{ room }} />
        </li>
        {lists}
      </ul>
    </>
  );
}

function NewComment({ topic }) {
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const message = inputRef.current.value;
    fetch(`/api/topics/${topic._id}/comments`, {
      method: "POST",
      headers: {
        "X-CSRF-Token": document
          .querySelector("meta[name=csrf-token]")
          .getAttribute("content"),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ comment: { message } }),
    }).then((res) => {
      console.log({ res });
      e.target.reset();
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input ref={inputRef} type="text" placeholder="comment" />
    </form>
  );
}

function Topic() {
  const { room_id, _id } = useParams();
  const [topic, setTopic] = useState();
  const [comments, setComments] = useState([]);
  const { centrifuge } = useContext(AppContext);

  useEffect(() => {
    if (!centrifuge) return;
    const sub = centrifuge.newSubscription(`topics/${_id}`);
    sub
      .on("publication", function (ctx) {
        setComments((a) => [...a, ctx.data.comment]);
      })
      .subscribe();

    return () => {
      centrifuge.removeSubscription(sub);
    };
  }, [centrifuge]);

  useEffect(() => {
    fetch(`/api/rooms/${room_id}topics/${_id}`)
      .then((res) => res.json())
      .then((topic) => setTopic(topic));

    fetch(`/api/rooms/${room_id}/topics/${_id}/comments`)
      .then((res) => res.json())
      .then((comments) => setComments(comments));
  }, []);

  const lists = comments.map((comment) => {
    return (
      <li key={comment._id}>
        {comment.user && <UserImage user={comment.user} />}
        {comment.message}
      </li>
    );
  });

  return (
    <>
      <Link to={`/rooms/${room_id}`}>Room</Link>
      <hr />
      <div>
        {topic && (
          <>
            <UserImage user={topic.user} />
            {topic.message}
          </>
        )}
      </div>
      <ul>
        {lists}
        <li key="new">
          <NewComment {...{ topic }} />
        </li>
      </ul>
    </>
  );
}

function NewRoom() {
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = inputRef.current.value;
    fetch("/api/rooms", {
      method: "POST",
      headers: {
        "X-CSRF-Token": document
          .querySelector("meta[name=csrf-token]")
          .getAttribute("content"),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ room: { name } }),
    }).then((res) => {
      console.log({ res });
      e.target.reset();
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input ref={inputRef} type="text" placeholder="New Room" />
    </form>
  );
}

function Rooms() {
  const limit = 5;
  const [rooms, setRooms] = useState([]);
  const { centrifuge, currentUserId } = useContext(AppContext);

  useEffect(() => {
    fetch("/api/rooms")
      .then((res) => res.json())
      .then((rooms) => {
        setRooms(rooms);
      });
  }, []);

  useEffect(() => {
    if (!centrifuge || !currentUserId) return;
    const sub = centrifuge.newSubscription(`/rooms#${currentUserId}`);
    // console.log({sub});
    sub
      .on("publication", function (ctx) {
        // console.log('publication:', { ctx });
        setRooms((a) => [ctx.data.room, ...a.slice(0, limit - 1)]);
      })
      .on("subscribing", function (ctx) {
        console.log("subscribing:", { ctx });
      })
      .on("subscribed", function (ctx) {
        console.log("subscribed:", { ctx });
      })
      .on("unsubscribed", function (ctx) {
        console.log("unsubscribed:", { ctx });
      })
      .subscribe();

    return () => centrifuge.removeSubscription(sub);
  }, [centrifuge, currentUserId]);

  return (
    <>
      <ul>
        <li key="new">
          <NewRoom />
        </li>
        {rooms.map((room) => {
          return (
            <li key={room._id}>
              <Link to={`/rooms/${room._id}`}>{room.name}</Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}

function Room() {
  const { _id } = useParams();
  const [room, setRoom] = useState({ _id });
  // const [topics, setTopics] = useState([]);
  const { centrifuge } = useContext(AppContext);

  useEffect(() => {
    if (!centrifuge) return;
    const sub = centrifuge.newSubscription(`/rooms/${_id}`);
    sub
      .on("publication", function (ctx) {
        setTopics((a) => [...a, ctx.data.topic]);
      })
      .subscribe();

    return () => {
      centrifuge.removeSubscription(sub);
    };
  }, [centrifuge]);

  useEffect(() => {
    fetch(`/api/rooms/${_id}`)
      .then((res) => res.json())
      .then((room) => setRoom(room));

    // fetch(`/api/rooms/${_id}/topics`)
    //   .then((res) => res.json())
    //   .then((topics) => setTopics(topics));
  }, []);

  // const lists = topics.map((topic) => {
  //   return (
  //     <li key={topic._id}>
  //       {topic.user && <UserImage user={topic.user} />}
  //       <Link to={`/rooms/${room._id}/topics/${topic._id}`}>
  //         {topic.message}
  //       </Link>
  //     </li>
  //   );
  // });

  return (
    <>
      <Link to="/">Rooms</Link>
      <hr />
      <div>
        {room && <>room: {room.name}</>}{" "}
        {room.users &&
          room.users.map((user) => <UserImage {...{ user, key: user._id }} />)}
      </div>
      <Topics {...{ room }} />
    </>
  );
}

function App() {
  const [counter, setCounter] = useState(0);
  const [centrifuge, setCentrifuge] = useState();
  const [currentUserId, setCurrentUserId] = useState();

  useEffect(() => {
    async function getToken() {
      const res = await fetch("/api/centrifugo/token");
      const data = await res.json();
      // console.log({ data });
      setCurrentUserId(JSON.parse(atob(data.token.split(".")[1])).sub);
      return data.token;
    }

    const host = document.getElementsByName("centrifugo-host")[0].content;
    const centrifuge = new Centrifuge(`${host}/connection/websocket`, {
      getToken,
    });
    console.log({ centrifuge });
    setCentrifuge(centrifuge);
    centrifuge
      .on("connecting", function (ctx) {
        console.log("connecting:", { ctx });
      })
      .on("connected", function (ctx) {
        console.log("connected:", { ctx });
      })
      .on("disconnected", function (ctx) {
        console.log("disconnected:", { ctx });
      })
      .connect();
  }, []);

  const router = createBrowserRouter([
    { path: "/", element: <Rooms /> },
    { path: "/rooms/:_id", element: <Room /> },
    // { path: '/', element: <Topics /> },
    { path: "/rooms/:room_id/topics/:_id", element: <Topic /> },
  ]);

  return (
    <AppContext.Provider value={{centrifuge, currentUserId}}>
      <RouterProvider router={router} />
    </AppContext.Provider>
  );
}

createRoot(document.getElementById("react-root")).render(<App />);
