function GazeDot({ x, y }) {
  return (
    <div
      style={{
        position: "fixed",
        left: x - 5,
        top: y - 5,
        width: 10,
        height: 10,
        backgroundColor: "red",
        borderRadius: "50%",
        zIndex: 9999,
        pointerEvents: "none",
      }}
    />
  );
}

export default GazeDot;
