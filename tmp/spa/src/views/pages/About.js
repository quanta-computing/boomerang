let About = {
    before_render: async () => {
    },
    render : async () => {
        let view =  /*html*/`
            <section class="section" onload="alert(tata())">
                <h1 onload="alert(toto())> About ERROR !</h1>
                <img src="/random_dog_picture.jpg">
            </section>
        `
        return view
    },
    after_render: async () => {
    alert(toto());
    }

}

export default About;
