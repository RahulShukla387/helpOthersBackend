
let UseCors = () => {
  return {
    origin: [
      "http://localhost:5173",
      "https://helpothers-five.vercel.app"
    ],
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  }
}

export { UseCors }
