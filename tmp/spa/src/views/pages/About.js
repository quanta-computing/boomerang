let About = {
    render : async () => {
        let view =  /*html*/`
            <section class="section">
                <h1> About </h1>
                <img src="/random_dog_picture.jpg">
            </section>
        `
        return view
    },
    after_render: async () => {}

}

export default About;
