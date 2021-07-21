import { query as q } from 'faunadb';

import NextAuth from 'next-auth'
import Providers from 'next-auth/providers'

import { fauna } from '../../../services/fauna';

export default NextAuth({
    // Configure one or more authentication providers
    providers: [
        Providers.GitHub({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            scope: 'read:user'
        }),
        // ...add more providers here
    ],
    callbacks: {
        async signIn(user, account, profile) {
            const { email } = user;

            try {
                await fauna.query(
                    // se o usuário com o email não existir, cria um registro, senão, busca o usuário
                    q.If(
                        q.Not(
                            q.Exists(
                                q.Match(
                                    q.Index('user_by_email'),   // o index foi criado no fauna e é obrigatório para as buscas
                                    q.Casefold(user.email)      // transforma as letras anulando maiúsculas ou minúsculas
                                )
                            )
                        ),
                        q.Create(
                            q.Collection('users'),
                            { data: { email } }
                        ),
                        q.Get(
                            q.Match(
                                q.Index('user_by_email'),
                                q.Casefold(user.email)
                            )
                        )
                    )
                )

                return true
            } catch {
                return false
            }
        }
    }
});