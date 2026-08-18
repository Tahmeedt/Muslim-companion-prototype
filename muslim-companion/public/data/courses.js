const courses = {

    /* =================================
       BEGINNER
    ================================= */

    Beginner: [

        {
            id: "what-it-means-to-be-muslim",

            icon: "fa-star-and-crescent",

            category: "MEANING",

            title: "What Does It Mean to Be a Muslim?",

            description:
                "Learn what it means to be a Muslim and what Islam teaches.",

            lessons: [

                {
                    title:
                        "What do you need to do to be Muslim?",

                    description:
                        "Learn how a person becomes Muslim and what the declaration of faith means."
                },

                {
                    title:
                        "The Five Pillars of Islam",

                    description:
                        "Learn about the five fundamental acts that form the foundation of Muslim practice."
                },

                {
                    title:
                        "The Six Articles of Faith",

                    description:
                        "Learn about the fundamental beliefs that Muslims believe in."
                }

            ]

        },


        {
            id: "salah-foundations",

            icon: "fa-mosque",

            category: "SALAH",

            title: "Salah Foundations",

            description:
                "Learn the foundations of Salah and understand its importance in the life of a Muslim.",

            lessons: [

                {
                    title:
                        "What is Salah?",

                    description:
                        "Learn what Salah is and why it is important.",

                    quiz: [

                        {
                            question:
                                "What is Salah?",

                            options: [
                                "A type of charity",
                                "The formal prayer in Islam",
                                "A pilgrimage",
                                "A type of fasting"
                            ],

                            answer: 1
                        },

                        {
                            question:
                                "How many obligatory prayers do Muslims perform each day?",

                            options: [
                                "Three",
                                "Four",
                                "Five",
                                "Seven"
                            ],

                            answer: 2
                        }

                    ]
                },

                {
                    title:
                        "The Five Daily Prayers",

                    description:
                        "Learn about the five obligatory daily prayers.",

                    quiz: [
                        {
                            question: "Which prayer is performed at dawn?",
                            options: [
                                "Fajr",
                                "Dhuhr",
                                "Maghrib",
                                "Isha"
                            ],
                            answer: 0
                        },
                        {
                            question: "Which prayer is performed after sunset?",
                            options: [
                                "Asr",
                                "Maghrib",
                                "Dhuhr",
                                "Fajr"
                            ],
                            answer: 1
                        },
                        {
                            question: "Which prayer is the night prayer?",
                            options: [
                                "Dhuhr",
                                "Asr",
                                "Isha",
                                "Maghrib"
                            ],
                            answer: 2
                        }
                    ]
                },

                {
                    title:
                        "Preparing for Salah",

                    description:
                        "Learn what is needed before beginning Salah.",
                    quiz: [
                        {
                            question: "What should a Muslim do to purify themselves before Salah when purification is required?",
                            options: [
                                "Make wudu",
                                "Eat a meal",
                                "Go to sleep",
                                "Read a book"
                            ],
                            answer: 0
                        },
                        {
                            question: "Which direction do Muslims face during Salah?",
                            options: [
                                "The direction of the nearest mosque",
                                "The Qiblah",
                                "The direction of the sunrise",
                                "Any direction they choose"
                            ],
                            answer: 1
                        },
                        {
                            question: "What should a Muslim make sure of before beginning an obligatory prayer?",
                            options: [
                                "That the prayer time has begun",
                                "That it is midnight",
                                "That they have eaten",
                                "That they are outside"
                            ],
                            answer: 0
                        }
                    ]
                }

            ],
            finalQuiz: [
                {
                    question: "How many obligatory prayers do Muslims perform each day?",
                    options: [
                        "Three",
                        "Four",
                        "Five",
                        "Six"
                    ],
                    answer: 2
                },

                {
                    question: "Which prayer is performed at dawn?",
                    options: [
                        "Fajr",
                        "Dhuhr",
                        "Asr",
                        "Isha"
                    ],
                    answer: 0
                },

                {
                    question: "Which direction do Muslims face during Salah?",
                    options: [
                        "The direction of the sunrise",
                        "The Qiblah",
                        "Any direction they choose",
                        "The nearest mosque"
                    ],
                    answer: 1
                },

                {
                    question: "What is one important preparation for Salah?",
                    options: [
                        "Purification",
                        "Eating beforehand",
                        "Going outside",
                        "Sleeping"
                    ],
                    answer: 0
                },

                {
                    question: "Which of these is one of the five daily prayers?",
                    options: [
                        "Tahajjud",
                        "Duha",
                        "Asr",
                        "Eid"
                    ],
                    answer: 2
                }
            ]

        },


        {
            id: "aqeedah-foundations",

            icon: "fa-star-and-crescent",

            category: "AQEEDAH",

            title: "Aqeedah Foundations",

            description:
                "Explore the foundations of Islamic belief.",

            lessons: [

                {
                    title:
                        "What is Aqeedah?",

                    description:
                        "Learn what Aqeedah means and why it matters."
                },

                {
                    title:
                        "Belief in Allah",

                    description:
                        "Learn about the foundation of Islamic belief."
                },

                {
                    title:
                        "The Six Articles of Faith",

                    description:
                        "Explore the fundamental beliefs of Islam."
                }

            ]

        },


        {
            id: "seerah-foundations",

            icon: "fa-clock-rotate-left",

            category: "SEERAH",

            title: "The Life of the Prophet ﷺ",

            description:
                "Learn about the life and example of Prophet Muhammad ﷺ.",

            lessons: [

                {
                    title:
                        "What is Seerah?",

                    description:
                        "Learn what Seerah means and why studying it is important."
                },

                {
                    title:
                        "The Birth of Prophet Muhammad ﷺ",

                    description:
                        "Learn about the early life of the Prophet ﷺ."
                },

                {
                    title:
                        "The Beginning of Revelation",

                    description:
                        "Learn about the beginning of the Prophet's mission."
                }

            ]

        }

    ],



    /* =================================
       INTERMEDIATE
    ================================= */

    Intermediate: [

        {
            id: "quran-understanding",

            icon: "fa-book-quran",

            category: "QUR'AN",

            title: "Understanding the Qur'an",

            description:
                "Develop your understanding of the Qur'an and its teachings.",

            lessons: [

                {
                    title:
                        "Understanding the Qur'an",

                    description:
                        "Explore the purpose and message of the Qur'an."
                },

                {
                    title:
                        "Understanding Revelation",

                    description:
                        "Learn more about how revelation was given."
                },

                {
                    title:
                        "Living by the Qur'an",

                    description:
                        "Explore how Muslims apply the teachings of the Qur'an."
                }

            ]

        },


        {
            id: "salah-developing",

            icon: "fa-mosque",

            category: "SALAH",

            title: "Developing Your Salah",

            description:
                "Build upon your understanding of Salah and its importance.",

            lessons: [

                {
                    title:
                        "Improving Your Salah",

                    description:
                        "Explore ways to strengthen your understanding of prayer."
                },

                {
                    title:
                        "Understanding Khushu",

                    description:
                        "Learn about concentration and humility during Salah."
                },

                {
                    title:
                        "Common Salah Mistakes",

                    description:
                        "Learn about common areas that Muslims should be aware of when praying."
                }

            ]

        },


        {
            id: "aqeedah",

            icon: "fa-star-and-crescent",

            category: "AQEEDAH",

            title: "Aqeedah",

            description:
                "Explore Islamic beliefs in greater depth.",

            lessons: [

                {
                    title:
                        "Understanding Tawheed",

                    description:
                        "Explore the concept of worshipping Allah alone."
                },

                {
                    title:
                        "Names and Attributes of Allah",

                    description:
                        "Learn about the names and attributes of Allah."
                },

                {
                    title:
                        "The Articles of Faith",

                    description:
                        "Explore the foundations of Islamic belief in greater depth."
                }

            ]

        },


        {
            id: "seerah",

            icon: "fa-clock-rotate-left",

            category: "SEERAH",

            title: "The Seerah",

            description:
                "Explore important events from the life of Prophet Muhammad ﷺ.",

            lessons: [

                {
                    title:
                        "Early Life of the Prophet ﷺ",

                    description:
                        "Explore the early life of Prophet Muhammad ﷺ."
                },

                {
                    title:
                        "The Makkan Period",

                    description:
                        "Learn about important events during the Makkan period."
                },

                {
                    title:
                        "The Madinan Period",

                    description:
                        "Learn about important events during the Madinan period."
                }

            ]

        }

    ],



    /* =================================
       ADVANCED
    ================================= */

    Advanced: []

};