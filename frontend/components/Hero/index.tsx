import Image from "next/legacy/image"

import classes from '@/components/Hero/hero.module.css'

export const Hero = () => {
    return <section className={classes.hero}>
        <div className={classes.image}>
            <Image src="/images/site/vercel.svg" alt="An Hero image" width={300} height={300} />
        </div>
        <h1>Hi </h1>
        <p>I blog about descriptiion</p>

    </section>
}