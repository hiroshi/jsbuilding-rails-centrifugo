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

function csrfTokenHeaders() {
  const token = document
    .querySelector("meta[name=csrf-token]")
    .getAttribute("content");
  return {
    "X-CSRF-Token": token,
    "Content-Type": "application/json",
  };
}

const AppContext = createContext(null);

function UserImage({ user }) {
  return <img src={user.image_url} width="18" title={user.email} />;
}

function Users({ users }) {
  return users.map((user) => <UserImage {...{ user, key: user._id }} />);
}

function NewTopic({ room }) {
  // console.log({ room });
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const message = inputRef.current.value;
    fetch(`/api/rooms/${room._id}/topics`, {
      method: "POST",
      headers: csrfTokenHeaders(),
      body: JSON.stringify({ topic: { message } }),
    }).then((res) => {
      console.log({ res });
      e.target.reset();
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input ref={inputRef} type="text" placeholder="new topic" />
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
        console.log("publication:", { ctx });
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
    const comments_count = topic.comments_count > 0 && (
      <span title={`${topic.comments_count} comments`}>
        ({topic.comments_count})
      </span>
    );
    return (
      <li key={topic._id}>
        {topic.user && <UserImage user={topic.user} />}&nbsp;
        <Link to={`/rooms/${room._id}/topics/${topic._id}`}>
          {topic.message}
        </Link>
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

function NewComment({ room_id, topic }) {
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const message = inputRef.current.value;
    fetch(`/api/rooms/${room_id}/topics/${topic._id}/comments`, {
      method: "POST",
      headers: csrfTokenHeaders(),
      body: JSON.stringify({ comment: { message } }),
    }).then((res) => {
      console.log({ res });
      e.target.reset();
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input ref={inputRef} type="text" placeholder="new comment" />
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
    fetch(`/api/rooms/${room_id}/topics/${_id}`)
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
      <Link to={`/rooms/${room_id}`}>&lt; room: {topic?.room?.name}</Link>
      <hr />
      <div>
        {topic && (
          <>
            <UserImage user={topic.user} /> {topic.message}
          </>
        )}
      </div>
      <br />
      comments:
      <ul>
        {lists}
        <li key="new">
          <NewComment {...{ room_id, topic }} />
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
      headers: csrfTokenHeaders(),
      body: JSON.stringify({ room: { name } }),
    }).then((res) => {
      console.log({ res });
      e.target.reset();
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input ref={inputRef} type="text" placeholder="new room" />
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
      rooms:
      <ul>
        <li key="new">
          <NewRoom />
        </li>
        {rooms.map((room) => {
          return (
            <li key={room._id}>
              <Link to={`/rooms/${room._id}`}>{room.name}</Link>{" "}
              <Users users={room.users} />
            </li>
          );
        })}
      </ul>
    </>
  );
}

function RoomInvite({ room, setInviting }) {
  const inputRef = useRef();

  const handleSubmit = (e) => {
    e.preventDefault();
    const email = inputRef.current.value;
    fetch(`/api/rooms/${room._id}/users`, {
      method: "POST",
      headers: csrfTokenHeaders(),
      body: JSON.stringify({ email }),
    }).then((res) => {
      e.target.reset();
      setInviting(false);
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input ref={inputRef} placeholder="email to invite" />
    </form>
  );
}

function Room() {
  const { _id } = useParams();
  const [room, setRoom] = useState();
  const { centrifuge } = useContext(AppContext);
  const [inviting, setInviting] = useState(false);

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
  }, []);

  const handleClickInvite = (e) => {
    setInviting(!inviting);
  };

  return (
    <>
      <Link to="/">&lt; Rooms</Link>
      <hr />
      {room && (
        <>
          <div>room: {room.name}</div>
          <br />
          <div>
            users: <Users users={room.users} />
            <button title="invite..." onClick={handleClickInvite}>
              +
            </button>
            {inviting && <RoomInvite {...{ room }} />}
          </div>
          <br />
          topics: <Topics {...{ room }} />
        </>
      )}
    </>
  );
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function PushNotificationPermission() {
  const handleClick = async () => {
    const registration =
      await navigator.serviceWorker.register("./serviceworker.js");

    const result = await window.Notification.requestPermission();

    if (result === "granted") {
      console.log({ registration });
      const pubKey = document.getElementsByName("webpush-pubkey")[0].content;
      console.log({ pubKey });
      let subscription;
      subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        // const oldKey = subscription.getKey("p256dh");
        // console.log({ oldKey });
        // console.log(subscription.toJSON());
        const unsubscribed = await subscription.unsubscribe();
        console.log({ unsubscribed });
      }
      // console.log({ keyChanged: urlBase64ToUint8Array(pubKey) !== oldKey });
      subscription = await registration.pushManager.subscribe({
        applicationServerKey: urlBase64ToUint8Array(pubKey),
        userVisibleOnly: true,
      });
      console.log({ subscription });
      const endpoint = subscription.endpoint;
      console.log(endpoint);

      fetch(`/api/webpush_subscriptions`, {
        method: "POST",
        headers: csrfTokenHeaders(),
        body: JSON.stringify({ subscription: { endpoint } }),
      }).then((res) => {
        console.log({ res });
      });
    }
  };

  return <button onClick={handleClick}>Enable push notification</button>;
}

function App() {
  const [counter, setCounter] = useState(0);
  const [centrifuge, setCentrifuge] = useState();
  const [currentUserId, setCurrentUserId] = useState();

  useEffect(() => {
    async function getToken() {
      try {
        const res = await fetch("/api/centrifugo/token");
        const data = await res.json();
        setCurrentUserId(JSON.parse(atob(data.token.split(".")[1])).sub);
        return data.token;
      } catch {
        // https://centrifugal.dev/docs/4/transports/client_api#client-connection-token
        // If your callback returns an empty string – this means the user has no permission to connect to Centrifugo and the Client will move to a disconnected state
        return "";
      }
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

  const rootElement = currentUserId ? <Rooms /> : <></>;

  const router = createBrowserRouter([
    { path: "/", element: rootElement },
    { path: "/rooms/:_id", element: <Room /> },
    // { path: '/', element: <Topics /> },
    { path: "/rooms/:room_id/topics/:_id", element: <Topic /> },
  ]);

  return (
    <AppContext.Provider value={{ centrifuge, currentUserId }}>
      <PushNotificationPermission />
      <hr />
      <RouterProvider router={router} />
    </AppContext.Provider>
  );
}

createRoot(document.getElementById("react-root")).render(<App />);
