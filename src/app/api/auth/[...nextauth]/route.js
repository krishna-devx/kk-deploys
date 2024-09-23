import NextAuth from "next-auth";

// importing providers
import GithubProvider from "next-auth/providers/github";

console.log(">>>>", process.env.GITHUB_ID);
const handler = NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      authorization: {
        params: {
          scope: "read:user user:email repo",
        },
      },

      //   scope: ["read:user" ,"user:email" ,"repo"],
    }),
  ],
  callbacks: {
    async jwt({ token,account }) {
      console.log("jwt token>>>", token);
    // console.log("access",account)
      // console.log("acess token",account.access_token)
      // Persist the OAuth access_token to the token right after signin
    if(!token.accessToken){
        token.accessToken = account.access_token
    }
    
      return token;
    },
    async session({ session,token }) {
      console.log("sesssion token>>", session);
      // Send properties to the client, like an access_token from a provider.
      session.accessToken = token.accessToken;
      return session;
    },
  },
});

export { handler as GET, handler as POST };
