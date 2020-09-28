interface IAuth {
  userId: number
}

interface IRoles {
  id: number
  slug: string
}

declare module '@ioc:Adonis/Core/Request' {
    interface RequestContract {
      auth?: IAuth
      roles?: IRoles[]
    }
}