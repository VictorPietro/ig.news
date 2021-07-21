import { query as q } from "faunadb";
import { fauna } from "../../../services/fauna";
import { stripe } from "../../../services/stripe";

export async function saveSubscription(
    subscriptionId: string,
    customerId: string,
    createAction = false
) {
    // buscar o user no FaunaDB com o ID {customerId} (não esquecer de criar um índice no Fauna)
    const userRef = await fauna.query(
        q.Select(
            "ref",
            q.Get(
                q.Match(
                    q.Index('user_by_stripe_customer_id'),
                    customerId
                )
            )
        )
    )

    // salvar os dados da subscription no FaunaDB
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)

    const subscriptionData = {
        id: subscription.id,
        userId: userRef,
        status: subscription.status,
        price_id: subscription.items.data[0].price.id,
    }

    // checkout.session.completed ou customer.subscriptions.created - no caso, não estamos usando o customer.subscriptions.created, mas se tivesse, teria que verificar na hora de criar se já existe ou não, senão estaríamos registros duplicados
    if (createAction) {
        await fauna.query(
            q.Create(
                q.Collection('subscriptions'),
                { data: subscriptionData }
            )
        )
    } else {
        await fauna.query(
            // para atualizar um registro no Fauna, pode-se usar update ou replace
            // replace substitui completamente o registro, e o update pode atualizar apenas campos específicos
            // param1: o que quer subscrever; param2: qual dado quer inserir
            q.Replace(
                q.Select(
                    "ref",
                    q.Get(
                        q.Match(
                            q.Index('subscription_by_id'),
                            subscriptionId
                        )
                    )
                ),
                {
                    data: subscriptionData
                }
            )
        )
    }
}