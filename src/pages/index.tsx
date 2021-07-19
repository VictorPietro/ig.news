import { GetStaticProps } from 'next';
import Head from 'next/head';

import SubscribeButton from '../components/SubscribeButton';
import { stripe } from '../services/stripe';

import styles from './home.module.scss';

interface HomeProps {
	product: {
		priceId: string;
		amount: number;
	}
}

// posso pegar as props aqui como argumento de Home
export default function Home({ product }: HomeProps) {
	return (
		<>
			<Head>
				<title>Home | ig.news</title>
			</Head>

			<main className={styles.contentContainer}>
				<section className={styles.hero}>
					<span>👏 Hey, welcome</span>
					<h1>News about the <span>React</span> world.</h1>
					<p>
						Get access to all the publications <br />
						<span>for {product.amount}/month</span>
					</p>
					<SubscribeButton priceId={product.priceId} />
				</section>

				<img src="/images/avatar.svg" alt="Girl coding" />
			</main>
		</>
	)
}

// todo código executado aqui dentro é no servidor node, e não no browser cliente
export const getStaticProps: GetStaticProps = async () => {
	const price = await stripe.prices.retrieve('price_1JF1OkERAKmEEOXhoUA9snBa', {
		expand: ['product']	// busca todas as informações do produto (no caso, não usaremos)
	});

	const product = {
		priceId: price.id,
		// divide por 100 para salvar em centavos e manipular com mais facilidade
		amount: new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
		}).format(price.unit_amount / 100),
	}

	return {
		props: {
			product,
		},
		revalidate: 60 * 60 * 24 // 24 hours
	}
}