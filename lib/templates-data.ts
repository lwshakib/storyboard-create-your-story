import { Slide } from "@/types/editor";

export interface Template {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  slides: Slide[];
  type?: 'NORMAL' | 'ADVANCED';
}

export const StoryTemplates: Template[] = [
  {
    id: "product-launch",
    title: "Product Launch",
    description: "A professional deck for announcing a new product with high-contrast minimalist visuals.",
    thumbnail: "/templates/prod_hero_new.png",
    slides: [
      {
        id: 0,
        bgColor: "#ffffff",
        elements: [
          {
            id: "pl-welcome-t1",
            type: "text",
            content: "WELCOME TO THE FUTURE",
            x: 0,
            y: 150,
            width: 1024,
            height: 120,
            fontSize: 72,
            fontWeight: "900",
            color: "#000000",
            textAlign: "center"
          },
          {
            id: "pl-welcome-t2",
            type: "text",
            content: "Introducing a paradigm shift in how we interact with technology. Designed for clarity, built for impact.",
            x: 212,
            y: 320,
            width: 600,
            height: 100,
            fontSize: 24,
            fontWeight: "500",
            color: "#444444",
            textAlign: "center"
          }
        ]
      },
      {
        id: 1,
        bgColor: "#ffffff",
        elements: [
          {
            id: "pl-img-1",
            type: "image",
            src: "/templates/prod_hero_new.png",
            x: 50,
            y: 50,
            width: 500,
            height: 476,
            objectFit: "contain"
          },
          {
            id: "pl-t-1",
            type: "text",
            content: "PROJECT X: UNVEILED",
            x: 600,
            y: 100,
            width: 374,
            height: 100,
            fontSize: 56,
            fontWeight: "900",
            color: "#000000",
            textAlign: "right"
          },
          {
            id: "pl-t-2",
            type: "text",
            content: "We've spent the last three years perfecting every curve, every circuit, and every line of code. Project X represents the culmination of thousands of hours of research and development, aimed at solving the most persistent challenges in the modern ecosystem.",
            x: 580,
            y: 250,
            width: 394,
            height: 250,
            fontSize: 18,
            fontWeight: "500",
            color: "#666666",
            textAlign: "right"
          }
        ]
      },
      {
        id: 2,
        bgColor: "#000000",
        elements: [
          {
            id: "pl-img-2",
            type: "image",
            src: "/templates/prod_problem_new.png",
            x: 512,
            y: 0,
            width: 512,
            height: 576,
            objectFit: "cover"
          },
          {
            id: "pl-t-3",
            type: "text",
            content: "THE COST OF CHAOS",
            x: 50,
            y: 100,
            width: 412,
            height: 100,
            fontSize: 48,
            fontWeight: "900",
            color: "#ffffff",
            textAlign: "left"
          },
          {
            id: "pl-t-4",
            type: "text",
            content: "Fragmented systems aren't just an inconvenience; they are a systemic drain on global productivity. Currently, businesses lose billions annually to operational silos, redundant infrastructure, and the inability to process data in real-time. We've reached a critical breaking point where traditional solutions can no longer keep pace with the exponential growth of demand.",
            x: 50,
            y: 250,
            width: 412,
            height: 300,
            fontSize: 18,
            fontWeight: "500",
            color: "rgba(255,255,255,0.7)",
            textAlign: "left"
          }
        ]
      },
      {
        id: 3,
        bgColor: "#ffffff",
        elements: [
          {
            id: "pl-img-3",
            type: "image",
            src: "/templates/prod_solution_new.png",
            x: 0,
            y: 0,
            width: 512,
            height: 576,
            objectFit: "cover"
          },
          {
            id: "pl-t-5",
            type: "text",
            content: "UNIFIED ORCHESTRATION",
            x: 562,
            y: 100,
            width: 412,
            height: 100,
            fontSize: 44,
            fontWeight: "900",
            color: "#000000",
            textAlign: "left"
          },
          {
            id: "pl-t-6",
            type: "text",
            content: "Our unified neural orchestration engine acts as a central nervous system for your entire organization. By harmonizing every digital touchpoint, we eliminate the friction that slows you down. Early adopters have reported a staggering 60% reduction in overhead costs and a consistent doubling of operational throughput within the first quarter of implementation.",
            x: 562,
            y: 250,
            width: 412,
            height: 300,
            fontSize: 18,
            fontWeight: "500",
            color: "#666666",
            textAlign: "left"
          }
        ]
      },
      {
        id: 4,
        bgColor: "#000000",
        elements: [
          {
            id: "pl-img-4",
            type: "image",
            src: "/templates/prod_hero_new.png",
            x: 512,
            y: 0,
            width: 512,
            height: 576,
            objectFit: "cover"
          },
          {
            id: "pl-t-7",
            type: "text",
            content: "UNMATCHED EFFICIENCY",
            x: 50,
            y: 100,
            width: 412,
            height: 100,
            fontSize: 48,
            fontWeight: "900",
            color: "#ffffff",
            textAlign: "left"
          },
          {
            id: "pl-t-8",
            type: "text",
            content: "Efficiency isn't just a metric; it's our philosophy. By optimizing the path between intent and action, our platform removes the cognitive load that hampers peak performance. Every interaction is measured in milliseconds, ensuring that your workflow remains fluid and uninterrupted.",
            x: 50,
            y: 250,
            width: 412,
            height: 300,
            fontSize: 18,
            fontWeight: "500",
            color: "rgba(255,255,255,0.7)",
            textAlign: "left"
          }
        ]
      },
      {
        id: 5,
        bgColor: "#ffffff",
        elements: [
          {
            id: "pl-img-5",
            type: "image",
            src: "/templates/prod_problem_new.png",
            x: 0,
            y: 0,
            width: 512,
            height: 576,
            objectFit: "cover"
          },
          {
            id: "pl-t-9",
            type: "text",
            content: "SCALABLE ARCHITECTURE",
            x: 562,
            y: 100,
            width: 412,
            height: 100,
            fontSize: 44,
            fontWeight: "900",
            color: "#000000",
            textAlign: "right"
          },
          {
            id: "pl-t-10",
            type: "text",
            content: "Built on a foundation of resilience, our architecture grows with you. Whether you are managing a small team or a global enterprise, the core stays stable. We handle the complexity of scaling so you can focus on the creativity of your mission.",
            x: 562,
            y: 250,
            width: 412,
            height: 250,
            fontSize: 18,
            fontWeight: "500",
            color: "#666666",
            textAlign: "right"
          }
        ]
      },
      {
        id: 6,
        bgColor: "#000000",
        elements: [
          {
            id: "pl-t-11",
            type: "text",
            content: "A GLOBAL STANDARD",
            x: 0,
            y: 150,
            width: 1024,
            height: 120,
            fontSize: 64,
            fontWeight: "1000",
            color: "#ffffff",
            textAlign: "center"
          },
          {
            id: "pl-t-12",
            type: "text",
            content: "Over 500 leading organizations have already integrated our neural engine into their daily operations. We are not just creating a tool; we are defining the new standard for digital excellence in the 21st century.",
            x: 212,
            y: 320,
            width: 600,
            height: 150,
            fontSize: 22,
            fontWeight: "500",
            color: "rgba(255,255,255,0.6)",
            textAlign: "center"
          }
        ]
      },
      {
        id: 7,
        bgColor: "#ffffff",
        elements: [
          {
            id: "pl-table-1",
            type: "table",
            tableData: [
              [{ text: "Tier", isHeader: true }, { text: "Basic", isHeader: true }, { text: "Pro", isHeader: true }, { text: "Enterprise", isHeader: true }],
              [{ text: "Compute" }, { text: "Shared" }, { text: "Dedicated" }, { text: "Custom Cluster" }],
              [{ text: "Throughput" }, { text: "1.2x" }, { text: "5.5x" }, { text: "25x" }],
              [{ text: "Retention" }, { text: "30 Days" }, { text: "1 Year" }, { text: "Indefinite" }],
              [{ text: "SLA" }, { text: "99.0%" }, { text: "99.9%" }, { text: "99.99%" }]
            ],
            x: 50,
            y: 120,
            width: 500,
            height: 350,
            tableBgColor: "#ffffff",
            borderColor: "#e5e7eb",
            color: "#111827"
          },
          {
            id: "pl-t-13",
            type: "text",
            content: "OPERATIONAL SCALING",
            x: 600,
            y: 100,
            width: 374,
            height: 100,
            fontSize: 44,
            fontWeight: "900",
            color: "#000000",
            textAlign: "left"
          },
          {
            id: "pl-t-14",
            type: "text",
            content: "Designed to grow with your data. Our subscription tiers are architected to provide linear performance gains as you scale, ensuring that your core workflows remain responsive regardless of the complexity or volume of the underlying data streams.",
            x: 600,
            y: 250,
            width: 374,
            height: 250,
            fontSize: 18,
            fontWeight: "500",
            color: "#666666",
            textAlign: "left"
          }
        ]
      },
      {
        id: 8,
        bgColor: "#000000",
        elements: [
          {
            id: "pl-t-15",
            type: "text",
            content: "TRUSTED BY PIONEERS",
            x: 50,
            y: 50,
            width: 924,
            height: 80,
            fontSize: 48,
            fontWeight: "900",
            color: "#ffffff",
            textAlign: "center"
          },
          {
            id: "pl-t-16",
            type: "text",
            content: "\"The most significant leap in operational technology I've seen in two decades. It's not just faster; it's smarter.\"\n\n— CTO, GLOBAL INNOVATIONS",
            x: 100,
            y: 150,
            width: 824,
            height: 220,
            fontSize: 32,
            fontWeight: "500",
            color: "#3b82f6",
            textAlign: "center"
          },
          {
            id: "pl-t-17",
            type: "text",
            content: "\"A revolutionary approach to data orchestration. Finally, a tool that keeps up with our ambition.\"\n\n— DIRECTOR OF STRATEGY, FINTECH HUB",
            x: 100,
            y: 420,
            width: 824,
            height: 120,
            fontSize: 24,
            fontWeight: "400",
            color: "rgba(255,255,255,0.7)",
            textAlign: "center"
          }
        ]
      },
      {
        id: 99,
        bgColor: "#ffffff",
        elements: [
          {
            id: "pl-end-t1",
            type: "text",
            content: "THE JOURNEY BEGINS",
            x: 0,
            y: 150,
            width: 1024,
            height: 120,
            fontSize: 64,
            fontWeight: "900",
            color: "#000000",
            textAlign: "center"
          },
          {
            id: "pl-end-t2",
            type: "text",
            content: "Join us in reshaping the future of interaction. Visit storyboard.ai to learn more about how we can transform your vision into reality.",
            x: 212,
            y: 320,
            width: 600,
            height: 100,
            fontSize: 22,
            fontWeight: "600",
            color: "#1e40af",
            textAlign: "center"
          }
        ]
      }
    ]
  },
  {
    id: "ai-history",
    title: "The Evolution of AI",
    description: "A historical journey through the milestones of Artificial Intelligence with minimalist visuals.",
    thumbnail: "/templates/ai_hist_4_new.png",
    slides: [
      {
        id: 0,
        bgColor: "#000000",
        elements: [
          {
            id: "aih-welcome-t1",
            type: "text",
            content: "BEYOND HUMAN LIMITS",
            x: 0,
            y: 150,
            width: 1024,
            height: 120,
            fontSize: 64,
            fontWeight: "1000",
            color: "#ffffff",
            textAlign: "center"
          },
          {
            id: "aih-welcome-t2",
            type: "text",
            content: "A definitive timeline of Artificial Intelligence. From theoretical foundations to the generative revolution.",
            x: 212,
            y: 320,
            width: 600,
            height: 100,
            fontSize: 22,
            fontWeight: "500",
            color: "rgba(255,255,255,0.6)",
            textAlign: "center"
          }
        ]
      },
      {
        id: 1,
        bgColor: "#000000",
        elements: [
          {
            id: "aih-img-1",
            type: "image",
            src: "/templates/ai_hist_1_new.png",
            x: 512,
            y: 0,
            width: 512,
            height: 576,
            objectFit: "cover"
          },
          {
            id: "aih-t-1",
            type: "text",
            content: "THE BIRTH OF A DREAM",
            x: 50,
            y: 120,
            width: 412,
            height: 120,
            fontSize: 48,
            fontWeight: "1000",
            color: "#ffffff",
            textAlign: "left"
          },
          {
            id: "aih-t-2",
            type: "text",
            content: "In the summer of 1956, a small group of visionary scientists gathered at Dartmouth College. It was here that the term 'Artificial Intelligence' was first officially proposed. They believed that every aspect of learning or any other feature of intelligence could be so precisely described that a machine could be made to simulate it.",
            x: 50,
            y: 270,
            width: 412,
            height: 250,
            fontSize: 18,
            fontWeight: "500",
            color: "rgba(255,255,255,0.6)",
            textAlign: "left"
          }
        ]
      },
      {
        id: 2,
        bgColor: "#ffffff",
        elements: [
          {
            id: "aih-img-2",
            type: "image",
            src: "/templates/ai_hist_2_new.png",
            x: 0,
            y: 0,
            width: 512,
            height: 576,
            objectFit: "cover"
          },
          {
            id: "aih-t-3",
            type: "text",
            content: "SHAKEY: THE PIONEER",
            x: 562,
            y: 120,
            width: 412,
            height: 120,
            fontSize: 48,
            fontWeight: "900",
            color: "#000000",
            textAlign: "left"
          },
          {
            id: "aih-t-4",
            type: "text",
            content: "By 1966, researchers at SRI International developed Shakey, the world's first general-purpose mobile robot. Unlike previous machines, Shakey could reason about its own actions and navigate its surroundings using cameras and sensors, laying the groundwork for modern robotics and autonomous navigation systems.",
            x: 562,
            y: 270,
            width: 412,
            height: 250,
            fontSize: 18,
            fontWeight: "500",
            color: "#666666",
            textAlign: "left"
          }
        ]
      },
      {
        id: 3,
        bgColor: "#000000",
        elements: [
          {
            id: "aih-img-3",
            type: "image",
            src: "/templates/ai_hist_3_new.png",
            x: 512,
            y: 0,
            width: 512,
            height: 576,
            objectFit: "cover"
          },
          {
            id: "aih-t-5",
            type: "text",
            content: "TRIUMPH AT THE BOARD",
            x: 50,
            y: 120,
            width: 412,
            height: 120,
            fontSize: 48,
            fontWeight: "900",
            color: "#ffffff",
            textAlign: "left"
          },
          {
            id: "aih-t-6",
            type: "text",
            content: "1997 marked a watershed moment in human-machine interaction. IBM's Deep Blue defeated world chess champion Garry Kasparov in a six-game match. It was a stunning demonstration of pure computational logic and brute-force strategy, proving that machines could out-think the best human minds in complex closed systems.",
            x: 50,
            y: 270,
            width: 412,
            height: 250,
            fontSize: 18,
            fontWeight: "500",
            color: "rgba(255,255,255,0.6)",
            textAlign: "left"
          }
        ]
      },
      {
        id: 4,
        bgColor: "#ffffff",
        elements: [
          {
            id: "aih-img-4",
            type: "image",
            src: "/templates/ai_hist_4_new.png",
            x: 0,
            y: 0,
            width: 512,
            height: 576,
            objectFit: "cover"
          },
          {
            id: "aih-t-7",
            type: "text",
            content: "THE NEURAL NET REBIRTH",
            x: 562,
            y: 120,
            width: 412,
            height: 120,
            fontSize: 42,
            fontWeight: "900",
            color: "#000000",
            textAlign: "left"
          },
          {
            id: "aih-t-8",
            type: "text",
            content: "For decades, neural networks were considered a secondary approach. However, in 2012, AlexNet shattered expectations at the ImageNet competition. This marked the beginning of the Deep Learning era, where massive datasets and GPU power finally unlocked the true potential of connectionist intelligence.",
            x: 562,
            y: 270,
            width: 412,
            height: 250,
            fontSize: 18,
            fontWeight: "500",
            color: "#666666",
            textAlign: "left"
          }
        ]
      },
      {
        id: 5,
        bgColor: "#000000",
        elements: [
          {
            id: "aih-img-5",
            type: "image",
            src: "/templates/ai_hist_1_new.png",
            x: 512,
            y: 0,
            width: 512,
            height: 576,
            objectFit: "cover"
          },
          {
            id: "aih-t-9",
            type: "text",
            content: "TRANSFORMERS ARRIVE",
            x: 50,
            y: 120,
            width: 412,
            height: 120,
            fontSize: 48,
            fontWeight: "1000",
            color: "#ffffff",
            textAlign: "right"
          },
          {
            id: "aih-t-10",
            type: "text",
            content: "In 2017, Google researchers published 'Attention Is All You Need', introducing the Transformer architecture. This breakthrough allowed models to process information in parallel and understand context with unprecedented depth, paving the way for the Large Language Models we use today.",
            x: 50,
            y: 270,
            width: 412,
            height: 250,
            fontSize: 18,
            fontWeight: "500",
            color: "rgba(255,255,255,0.6)",
            textAlign: "right"
          }
        ]
      },
      {
        id: 6,
        bgColor: "#ffffff",
        elements: [
          {
            id: "aih-t-11",
            type: "text",
            content: "THE GENERATIVE ERA",
            x: 0,
            y: 150,
            width: 1024,
            height: 120,
            fontSize: 64,
            fontWeight: "1000",
            color: "#000000",
            textAlign: "center"
          },
          {
            id: "aih-t-12",
            type: "text",
            content: "Today, AI can generate art, code, and prose that rival human creators. We are no longer just teaching machines to recognize the world; we are giving them the tools to imagine new ones. This shift from analytical to creative AI is the defining challenge of our time.",
            x: 212,
            y: 320,
            width: 600,
            height: 150,
            fontSize: 22,
            fontWeight: "500",
            color: "#666666",
            textAlign: "center"
          }
        ]
      },
      {
        id: 7,
        bgColor: "#000000",
        elements: [
          {
            id: "ai-table-1",
            type: "table",
            tableBgColor: "#000000",
            borderColor: "#374151",
            color: "#ffffff",
            tableData: [
              [{ text: "Model Era", isHeader: true }, { text: "Core Architecture", isHeader: true }, { text: "Key Emergence", isHeader: true }],
              [{ text: "Pre-2012" }, { text: "Symbolic/Perceptron" }, { text: "Logic Rules" }],
              [{ text: "2012-2016" }, { text: "CNN/RNN" }, { text: "Pattern Recognition" }],
              [{ text: "2017-2021" }, { text: "Transformer" }, { text: "Contextual Language" }],
              [{ text: "2022+" }, { text: "Multimodal Diffusion" }, { text: "Creative Synthesis" }]
            ],
            x: 50,
            y: 100,
            width: 500,
            height: 350
          },
          {
            id: "aih-t-13",
            type: "text",
            content: "ARCHITECTURAL EPOCHS",
            x: 562,
            y: 120,
            width: 412,
            height: 100,
            fontSize: 44,
            fontWeight: "900",
            color: "#ffffff",
            textAlign: "left"
          },
          {
            id: "aih-t-14",
            type: "text",
            content: "The evolution of AI is defined by structural shifts in how information is processed. From the rigid rules of early symbolic systems to the fluid, high-dimensional probability spaces of modern generative models, each era has redefined the boundary between data and intelligence.",
            x: 562,
            y: 250,
            width: 412,
            height: 250,
            fontSize: 18,
            fontWeight: "500",
            color: "rgba(255,255,255,0.6)",
            textAlign: "left"
          }
        ]
      },
      {
        id: 8,
        bgColor: "#ffffff",
        elements: [
          {
            id: "aih-t-15",
            type: "text",
            content: "THE ETHICAL FRONTIER",
            x: 0,
            y: 150,
            width: 1024,
            height: 120,
            fontSize: 56,
            fontWeight: "1000",
            color: "#000000",
            textAlign: "center"
          },
          {
            id: "aih-t-16",
            type: "text",
            content: "As AI becomes more integrated into our lives, questions of alignment, bias, and safety take center stage. We are not just building faster machines; we are building systems that must reflect our most deeply held values.",
            x: 212,
            y: 320,
            width: 600,
            height: 150,
            fontSize: 22,
            fontWeight: "500",
            color: "#444444",
            textAlign: "center"
          }
        ]
      },
      {
        id: 99,
        bgColor: "#000000",
        elements: [
          {
            id: "aih-end-t1",
            type: "text",
            content: "THE FUTURE IS CO-AUTHORED",
            x: 0,
            y: 150,
            width: 1024,
            height: 120,
            fontSize: 56,
            fontWeight: "1000",
            color: "#ffffff",
            textAlign: "center"
          },
          {
            id: "aih-end-t2",
            type: "text",
            content: "As we enter the age of Generative AI, the line between human creativity and machine intelligence continues to blur. What story will you tell next?",
            x: 212,
            y: 320,
            width: 600,
            height: 120,
            fontSize: 22,
            fontWeight: "500",
            color: "#60a5fa",
            textAlign: "center"
          }
        ]
      }
    ]
  },
  {
    id: "internet-history",
    title: "History of the Internet",
    description: "The digital revolution told through minimalist, high-contrast visuals.",
    thumbnail: "/templates/internet_2_new.png",
    slides: [
      {
        id: 0,
        bgColor: "#ffffff",
        elements: [
          {
            id: "int-welcome-t1",
            type: "text",
            content: "THE GLOBAL BRAIN",
            x: 0,
            y: 150,
            width: 1024,
            height: 120,
            fontSize: 72,
            fontWeight: "1000",
            color: "#000000",
            textAlign: "center"
          },
          {
            id: "int-welcome-t2",
            type: "text",
            content: "Charting the evolution of connectivity. From cold-war protocols to the infinite web.",
            x: 212,
            y: 320,
            width: 600,
            height: 100,
            fontSize: 24,
            fontWeight: "500",
            color: "#555555",
            textAlign: "center"
          }
        ]
      },
      {
        id: 1,
        bgColor: "#ffffff",
        elements: [
          {
            id: "int-img-1",
            type: "image",
            src: "/templates/internet_1_new.png",
            x: 50,
            y: 50,
            width: 500,
            height: 476,
            objectFit: "contain"
          },
          {
            id: "int-t-1",
            type: "text",
            content: "ARPANET: THE SPARK",
            x: 600,
            y: 120,
            width: 374,
            height: 100,
            fontSize: 56,
            fontWeight: "900",
            color: "#000000",
            textAlign: "right"
          },
          {
            id: "int-t-2",
            type: "text",
            content: "In the late 1960s, ARPANET introduced the world to packet-switching. This revolutionary concept allowed data to be broken into small bundles and sent across multiple paths, ensuring that a single failure wouldn't bring down the entire network—a design born out of the need for resilient communication.",
            x: 550,
            y: 250,
            width: 424,
            height: 300,
            fontSize: 18,
            fontWeight: "500",
            color: "#666666",
            textAlign: "right"
          }
        ]
      },
      {
        id: 2,
        bgColor: "#000000",
        elements: [
          {
            id: "int-img-2",
            type: "image",
            src: "/templates/internet_2_new.png",
            x: 512,
            y: 0,
            width: 512,
            height: 576,
            objectFit: "cover"
          },
          {
            id: "int-t-3",
            type: "text",
            content: "UNIVERSAL LANGUAGE",
            x: 50,
            y: 120,
            width: 412,
            height: 100,
            fontSize: 48,
            fontWeight: "900",
            color: "#ffffff",
            textAlign: "left"
          },
          {
            id: "int-t-4",
            type: "text",
            content: "TCP/IP became the de-facto language of the internet. By standardizing how different networks moved and addressed data, it allowed disparate systems to communicate seamlessly. This interoperability transformed isolated digital islands into a vast, interconnected continental shelf of information.",
            x: 50,
            y: 250,
            width: 412,
            height: 300,
            fontSize: 18,
            fontWeight: "500",
            color: "rgba(255,255,255,0.5)",
            textAlign: "left"
          }
        ]
      },
      {
        id: 3,
        bgColor: "#ffffff",
        elements: [
          {
            id: "int-img-3",
            type: "image",
            src: "/templates/internet_3_new.png",
            x: 50,
            y: 50,
            width: 500,
            height: 476,
            objectFit: "contain"
          },
          {
            id: "int-t-5",
            type: "text",
            content: "DEMOCRATIZING KNOWLEDGE",
            x: 600,
            y: 120,
            width: 374,
            height: 100,
            fontSize: 44,
            fontWeight: "1000",
            color: "#000000",
            textAlign: "right"
          },
          {
            id: "int-t-6",
            type: "text",
            content: "1989 changed everything when Tim Berners-Lee proposed the World Wide Web. By combining hypertext with the internet, he created a system where anyone could access and share information. The web democratized knowledge, collapsing barriers and sparking a global intellectual renaissance.",
            x: 550,
            y: 250,
            width: 424,
            height: 300,
            fontSize: 18,
            fontWeight: "500",
            color: "#666666",
            textAlign: "right"
          }
        ]
      },
      {
        id: 4,
        bgColor: "#000000",
        elements: [
          {
            id: "int-img-4",
            type: "image",
            src: "/templates/internet_1_new.png",
            x: 512,
            y: 0,
            width: 512,
            height: 576,
            objectFit: "cover"
          },
          {
            id: "int-t-7",
            type: "text",
            content: "THE DOT-COM BOOM",
            x: 50,
            y: 120,
            width: 412,
            height: 100,
            fontSize: 48,
            fontWeight: "900",
            color: "#ffffff",
            textAlign: "left"
          },
          {
            id: "int-t-8",
            type: "text",
            content: "The mid-90s saw the internet move from a research tool to a commercial juggernaut. Companies like Amazon and Google were born, fundamentally changing how we shop, work, and find information. The 'Web 1.0' era established the internet as the primary infrastructure for global commerce.",
            x: 50,
            y: 250,
            width: 412,
            height: 300,
            fontSize: 18,
            fontWeight: "500",
            color: "rgba(255,255,255,0.5)",
            textAlign: "left"
          }
        ]
      },
      {
        id: 5,
        bgColor: "#ffffff",
        elements: [
          {
            id: "int-img-5",
            type: "image",
            src: "/templates/internet_2_new.png",
            x: 0,
            y: 0,
            width: 512,
            height: 576,
            objectFit: "cover"
          },
          {
            id: "int-t-9",
            type: "text",
            content: "THE SOCIAL WEB",
            x: 562,
            y: 120,
            width: 412,
            height: 100,
            fontSize: 48,
            fontWeight: "1000",
            color: "#000000",
            textAlign: "right"
          },
          {
            id: "int-t-10",
            type: "text",
            content: "'Web 2.0' introduced the era of participation. Suddenly, the web wasn't just something you read—it was something you wrote. Social platforms enabled global conversations, citizen journalism, and new forms of community that transcended physical borders.",
            x: 562,
            y: 250,
            width: 412,
            height: 300,
            fontSize: 18,
            fontWeight: "500",
            color: "#666666",
            textAlign: "right"
          }
        ]
      },
      {
        id: 6,
        bgColor: "#000000",
        elements: [
          {
            id: "int-t-11",
            type: "text",
            content: "MOBILE REVOLUTION",
            x: 0,
            y: 150,
            width: 1024,
            height: 120,
            fontSize: 64,
            fontWeight: "1000",
            color: "#ffffff",
            textAlign: "center"
          },
          {
            id: "int-t-12",
            type: "text",
            content: "The smartphone put the entire internet in our pockets. Connection became constant and ubiquitous. This shift to the mobile web has redefined our relationship with time, space, and each other, making the digital world inseparable from the physical one.",
            x: 212,
            y: 320,
            width: 600,
            height: 150,
            fontSize: 22,
            fontWeight: "500",
            color: "rgba(255,255,255,0.7)",
            textAlign: "center"
          }
        ]
      },
      {
        id: 7,
        bgColor: "#ffffff",
        elements: [
          {
            id: "int-table-1",
            type: "table",
            tableBgColor: "#ffffff",
            borderColor: "#e5e7eb",
            color: "#111827",
            tableData: [
              [{ text: "Region", isHeader: true }, { text: "Penetration", isHeader: true }, { text: "Growth Rate", isHeader: true }],
              [{ text: "Global Peak" }, { text: "67.9%" }, { text: "4.2%" }],
              [{ text: "APAC" }, { text: "64.1%" }, { text: "5.8%" }],
              [{ text: "MENA" }, { text: "71.2%" }, { text: "3.1%" }],
              [{ text: "LATAM" }, { text: "78.4%" }, { text: "2.5%" }]
            ],
            x: 50,
            y: 100,
            width: 500,
            height: 350
          },
          {
            id: "int-t-13",
            type: "text",
            content: "REGIONAL REACH",
            x: 562,
            y: 120,
            width: 412,
            height: 100,
            fontSize: 44,
            fontWeight: "900",
            color: "#000000",
            textAlign: "left"
          },
          {
            id: "int-t-14",
            type: "text",
            content: "Internet access is no longer a luxury; it is a global utility. While developed markets approach saturation, the fastest growth is occurring in the Asia-Pacific region, where mobile-first infrastructure is bridging the digital divide at an unprecedented pace.",
            x: 562,
            y: 250,
            width: 412,
            height: 250,
            fontSize: 18,
            fontWeight: "500",
            color: "#666666",
            textAlign: "left"
          }
        ]
      },
      {
        id: 8,
        bgColor: "#000000",
        elements: [
          {
            id: "int-chart-2",
            type: "pie-chart",
            chartTitle: "INTERNET TRAFFIC BY TYPE",
            chartData: [
              { label: "Video", value: 65, color: "#f43f5e" },
              { label: "Social", value: 15, color: "#ec4899" },
              { label: "Gaming", value: 10, color: "#d946ef" },
              { label: "Web/Other", value: 10, color: "#a855f7" }
            ],
            x: 524,
            y: 100,
            width: 450,
            height: 350
          },
          {
            id: "int-t-15",
            type: "text",
            content: "CONTENT IS KING",
            x: 50,
            y: 120,
            width: 412,
            height: 100,
            fontSize: 48,
            fontWeight: "900",
            color: "#ffffff",
            textAlign: "right"
          },
          {
            id: "int-t-16",
            type: "text",
            content: "Video content now dominates the global bitstream, accounting for two-thirds of all internet traffic. As resolutions move toward 8K and beyond, the architecture of the web continues to adapt to the insatiable demand for visual immersion.",
            x: 100,
            y: 250,
            width: 412,
            height: 250,
            fontSize: 18,
            fontWeight: "500",
            color: "rgba(255,255,255,0.6)",
            textAlign: "right"
          }
        ]
      },
      {
        id: 99,
        bgColor: "#ffffff",
        elements: [
          {
            id: "int-end-t1",
            type: "text",
            content: "THE CONSTANT EVOLUTION",
            x: 0,
            y: 150,
            width: 1024,
            height: 120,
            fontSize: 64,
            fontWeight: "1000",
            color: "#000000",
            textAlign: "center"
          },
          {
            id: "int-end-t2",
            type: "text",
            content: "From dial-up tones to space-based fiber optics, the network only grows. The future of the internet is not just about speed, but about a more open and equitable connection for all.",
            x: 212,
            y: 320,
            width: 600,
            height: 120,
            fontSize: 22,
            fontWeight: "500",
            color: "#38bdf8",
            textAlign: "center"
          }
        ]
      }
    ]
  },
  {
    id: "space-exploration",
    title: "Space Exploration",
    description: "The giant leaps of humanity in a minimalist, high-contrast visual style.",
    thumbnail: "/templates/space_2_new.png",
    slides: [
      {
        id: 0,
        bgImage: "/templates/space_4_new.png",
        elements: [
          {
            id: "sp-overlay",
            type: "shape",
            shapeType: "rectangle",
            x: 0,
            y: 0,
            width: 1024,
            height: 576,
            color: "#000000",
            opacity: 0.6,
          },
          {
            id: "sp-welcome-t1",
            type: "text",
            content: "THE FINAL FRONTIER",
            x: 0,
            y: 150,
            width: 1024,
            height: 120,
            fontSize: 72,
            fontWeight: "900",
            color: "#ffffff",
            textAlign: "center"
          },
          {
            id: "sp-welcome-t2",
            type: "text",
            content: "A cinematic look at our journey beyond Earth. From the lunar dust to the Martian red.",
            x: 212,
            y: 320,
            width: 600,
            height: 100,
            fontSize: 24,
            fontWeight: "500",
            color: "rgba(255,255,255,0.6)",
            textAlign: "center"
          }
        ]
      },
      {
        id: 1,
        bgColor: "#000000",
        elements: [
          {
            id: "sp-img-1",
            type: "image",
            src: "/templates/space_1_new.png",
            x: 512,
            y: 0,
            width: 512,
            height: 576,
            objectFit: "cover"
          },
          {
            id: "sp-t-1",
            type: "text",
            content: "ASCENT: APOLLO 11",
            x: 50,
            y: 120,
            width: 412,
            height: 120,
            fontSize: 56,
            fontWeight: "900",
            color: "#ffffff",
            textAlign: "left"
          },
          {
            id: "sp-t-2",
            type: "text",
            content: "On July 16, 1969, the Saturn V rocket ignited, carrying three pioneers away from the only world humanity had ever known. This mission wasn't just a technical feat; it was a testament to what we can achieve when we unite behind a common, impossible goal.",
            x: 50,
            y: 280,
            width: 412,
            height: 270,
            fontSize: 18,
            fontWeight: "500",
            color: "rgba(255,255,255,0.5)",
            textAlign: "left"
          }
        ]
      },
      {
        id: 2,
        bgColor: "#000000",
        elements: [
          {
            id: "sp-img-2",
            type: "image",
            src: "/templates/space_2_new.png",
            x: 0,
            y: 0,
            width: 512,
            height: 576,
            objectFit: "cover"
          },
          {
            id: "sp-t-3",
            type: "text",
            content: "THE SILENT ECHO",
            x: 562,
            y: 120,
            width: 412,
            height: 120,
            fontSize: 48,
            fontWeight: "900",
            color: "#ffffff",
            textAlign: "left"
          },
          {
            id: "sp-t-4",
            type: "text",
            content: "The first footprint in the lunar dust is more than a mark; it's a permanent record of our curiosity. In the vacuum of the Moon, that print remains essentially unchanged, a silent echo of the moment man first stepped onto another celestial body.",
            x: 562,
            y: 280,
            width: 412,
            height: 270,
            fontSize: 18,
            fontWeight: "500",
            color: "rgba(255,255,255,0.5)",
            textAlign: "left"
          }
        ]
      },
      {
        id: 3,
        bgColor: "#000000",
        elements: [
          {
            id: "sp-img-3",
            type: "image",
            src: "/templates/space_3_new.png",
            x: 512,
            y: 0,
            width: 512,
            height: 576,
            objectFit: "cover"
          },
          {
            id: "sp-t-5",
            type: "text",
            content: "THE RED HORIZON",
            x: 50,
            y: 120,
            width: 412,
            height: 120,
            fontSize: 48,
            fontWeight: "1000",
            color: "#ffffff",
            textAlign: "left"
          },
          {
            id: "sp-t-6",
            type: "text",
            content: "Mars beckons as our next logical destination. Our robotic proxies, like the Perseverance rover, are already there, cataloging the terrain and searching for signs of ancient life. They are the advanced scouts for a multi-planetary future.",
            x: 50,
            y: 280,
            width: 412,
            height: 270,
            fontSize: 18,
            fontWeight: "500",
            color: "rgba(255,255,255,0.5)",
            textAlign: "left"
          }
        ]
      },
      {
        id: 4,
        bgColor: "#000000",
        elements: [
          {
            id: "sp-img-4",
            type: "image",
            src: "/templates/space_1_new.png",
            x: 0,
            y: 0,
            width: 512,
            height: 576,
            objectFit: "cover"
          },
          {
            id: "sp-t-7",
            type: "text",
            content: "DEEP SPACE PATHWAYS",
            x: 562,
            y: 120,
            width: 412,
            height: 120,
            fontSize: 44,
            fontWeight: "900",
            color: "#ffffff",
            textAlign: "left"
          },
          {
            id: "sp-t-8",
            type: "text",
            content: "Beyond our solar system lies the interstellar medium. Voyages like Voyager 1 and 2 have already crossed this threshold, carrying our greetings into the vast silence. They represent the first time human-made objects have truly left their home to wander the stars.",
            x: 562,
            y: 280,
            width: 412,
            height: 270,
            fontSize: 18,
            fontWeight: "500",
            color: "rgba(255,255,255,0.5)",
            textAlign: "left"
          }
        ]
      },
      {
        id: 5,
        bgColor: "#000000",
        elements: [
          {
            id: "sp-img-5",
            type: "image",
            src: "/templates/space_4_new.png",
            x: 512,
            y: 0,
            width: 512,
            height: 576,
            objectFit: "cover"
          },
          {
            id: "sp-t-9",
            type: "text",
            content: "STAYING CONNECTED",
            x: 50,
            y: 120,
            width: 412,
            height: 120,
            fontSize: 48,
            fontWeight: "1000",
            color: "#ffffff",
            textAlign: "right"
          },
          {
            id: "sp-t-10",
            type: "text",
            content: "Communication across the cosmos requires precision beyond measure. Using massive deep-space antennas, we maintain a fragile link with our robotic explorers, catching whispers of data from billions of miles away. It is our only tether to the far reaches of reality.",
            x: 50,
            y: 280,
            width: 412,
            height: 250,
            fontSize: 18,
            fontWeight: "500",
            color: "rgba(255,255,255,0.6)",
            textAlign: "right"
          }
        ]
      },
      {
        id: 6,
        bgImage: "/templates/space_2_new.png",
        elements: [
          {
            id: "sp-overlay-2",
            type: "shape",
            shapeType: "rectangle",
            x: 0,
            y: 0,
            width: 1024,
            height: 576,
            color: "#000000",
            opacity: 0.7,
          },
          {
            id: "sp-t-11",
            type: "text",
            content: "THE MULTI-PLANETARY VISION",
            x: 0,
            y: 150,
            width: 1024,
            height: 120,
            fontSize: 56,
            fontWeight: "1000",
            color: "#ffffff",
            textAlign: "center"
          },
          {
            id: "sp-t-12",
            type: "text",
            content: "Humanity's survival depends on our ability to become a multi-planetary species. This isn't just about exploration; it's about insurance for the flame of consciousness. The moon and mars are the first steps in a journey that will span centuries.",
            x: 212,
            y: 320,
            width: 600,
            height: 200,
            fontSize: 22,
            fontWeight: "500",
            color: "rgba(255,255,255,0.6)",
            textAlign: "center"
          }
        ]
      },
      {
        id: 7,
        bgColor: "#000000",
        elements: [
          {
            id: "sp-table-1",
            type: "table",
            tableBgColor: "#000000",
            borderColor: "#374151",
            color: "#ffffff",
            tableData: [
              [{ text: "Vessel", isHeader: true }, { text: "Destination", isHeader: true }, { text: "Payload", isHeader: true }],
              [{ text: "Starship" }, { text: "Mars/Orbit" }, { text: "100+ Tons" }],
              [{ text: "Falcon 9" }, { text: "LEO/GTO" }, { text: "22 Tons" }],
              [{ text: "Artemis" }, { text: "Lunar Gateway" }, { text: "27 Tons" }],
              [{ text: "Soyuz" }, { text: "ISS" }, { text: "7 Tons" }]
            ],
            x: 50,
            y: 100,
            width: 500,
            height: 350
          },
          {
            id: "sp-t-13",
            type: "text",
            content: "ORBITAL CAPACITY",
            x: 562,
            y: 120,
            width: 412,
            height: 100,
            fontSize: 44,
            fontWeight: "900",
            color: "#ffffff",
            textAlign: "left"
          },
          {
            id: "sp-t-14",
            type: "text",
            content: "The heavy-lift capabilities of the next generation of spacecraft will revolutionize our access to the solar system. By increasing payload mass and drastically reducing cost, we are opening the door to permanent human settlements beyond Earth's orbit.",
            x: 562,
            y: 250,
            width: 412,
            height: 250,
            fontSize: 18,
            fontWeight: "500",
            color: "rgba(255,255,255,0.6)",
            textAlign: "left"
          }
        ]
      },
      {
        id: 8,
        bgColor: "#000000",
        elements: [
          {
            id: "sp-t-15",
            type: "text",
            content: "EYES ON EXOPLANETS",
            x: 0,
            y: 150,
            width: 1024,
            height: 120,
            fontSize: 56,
            fontWeight: "1000",
            color: "#ffffff",
            textAlign: "center"
          },
          {
            id: "sp-t-16",
            type: "text",
            content: "With the help of advanced space telescopes, we have identified thousands of worlds orbiting distant stars. Some reside in the habitable zone, where liquid water could exist. Each discovery brings us closer to answering the ultimate question: are we alone in the universe?",
            x: 212,
            y: 320,
            width: 600,
            height: 200,
            fontSize: 22,
            fontWeight: "500",
            color: "rgba(255,255,255,0.5)",
            textAlign: "center"
          }
        ]
      },
      {
        id: 99,
        bgColor: "#000000",
        elements: [
          {
            id: "sp-end-t1",
            type: "text",
            content: "TO THE STARS",
            x: 0,
            y: 150,
            width: 1024,
            height: 120,
            fontSize: 64,
            fontWeight: "900",
            color: "#ffffff",
            textAlign: "center"
          },
          {
            id: "sp-end-t2",
            type: "text",
            content: "Adventure is in our DNA. Whether it's the edge of our galaxy or the depths of our own solar system, the journey never truly ends.",
            x: 212,
            y: 320,
            width: 600,
            height: 150,
            fontSize: 22,
            fontWeight: "500",
            color: "#fb7185",
            textAlign: "center"
          }
        ]
      }
    ]
  },
  {
    id: "climate-action",
    title: "Climate Action",
    description: "Urgent storytelling for our changing world using a minimalist aesthetic.",
    thumbnail: "/templates/climate_1_new.png",
    slides: [
      {
        id: 0,
        bgColor: "#ffffff",
        elements: [
          {
            id: "cl-welcome-t1",
            type: "text",
            content: "OUR PLANET, OUR CHOICE",
            x: 0,
            y: 150,
            width: 1024,
            height: 120,
            fontSize: 64,
            fontWeight: "1000",
            color: "#0c4a6e",
            textAlign: "center"
          },
          {
            id: "cl-welcome-t2",
            type: "text",
            content: "A visual exploration of the challenges and solutions for a sustainable future. The time to act is now.",
            x: 212,
            y: 320,
            width: 600,
            height: 100,
            fontSize: 22,
            fontWeight: "500",
            color: "#555555",
            textAlign: "center"
          }
        ]
      },
      {
        id: 1,
        bgColor: "#ffffff",
        elements: [
          {
            id: "cl-img-1",
            type: "image",
            src: "/templates/climate_1_new.png",
            x: 512,
            y: 0,
            width: 512,
            height: 576,
            objectFit: "cover"
          },
          {
            id: "cl-t-1",
            type: "text",
            content: "FRAGILE BALANCE",
            x: 50,
            y: 120,
            width: 412,
            height: 120,
            fontSize: 56,
            fontWeight: "900",
            color: "#0c4a6e",
            textAlign: "left"
          },
          {
            id: "cl-t-2",
            type: "text",
            content: "Our world is undergoing an unprecedented transformation. Global temperatures are rising, and the polar ice caps—nature's own cooling system—are retreating at a rate that threatens the very foundations of our coastal civilizations.",
            x: 50,
            y: 250,
            width: 412,
            height: 250,
            fontSize: 18,
            fontWeight: "500",
            color: "#555555",
            textAlign: "left"
          }
        ]
      },
      {
        id: 2,
        bgColor: "#ffffff",
        elements: [
          {
            id: "cl-img-2",
            type: "image",
            src: "/templates/climate_2_new.png",
            x: 0,
            y: 0,
            width: 512,
            height: 576,
            objectFit: "cover"
          },
          {
            id: "cl-t-3",
            type: "text",
            content: "THE POWER OF CHANGE",
            x: 562,
            y: 120,
            width: 412,
            height: 120,
            fontSize: 48,
            fontWeight: "900",
            color: "#14532d",
            textAlign: "left"
          },
          {
            id: "cl-t-4",
            type: "text",
            content: "The solution lies in our hands. Transitioning to 100% renewable energy is not just an environmental necessity; it is a massive economic opportunity to create a cleaner, more stable, and more equitable world for everyone.",
            x: 562,
            y: 250,
            width: 412,
            height: 250,
            fontSize: 18,
            fontWeight: "500",
            color: "#555555",
            textAlign: "left"
          }
        ]
      },
      {
        id: 3,
        bgColor: "#ffffff",
        elements: [
          {
            id: "cl-img-3",
            type: "image",
            src: "/templates/climate_3_new.png",
            x: 512,
            y: 0,
            width: 512,
            height: 576,
            objectFit: "cover"
          },
          {
            id: "cl-t-5",
            type: "text",
            content: "PROTECTING BIODIVERSITY",
            x: 50,
            y: 120,
            width: 412,
            height: 120,
            fontSize: 44,
            fontWeight: "1000",
            color: "#166534",
            textAlign: "left"
          },
          {
            id: "cl-t-6",
            type: "text",
            content: "Every species plays a vital role in our ecosystem. Protecting the remaining biodiversity hotspots is essential for maintaining the biological cycles that provide us with clean air, fresh water, and fertile soil.",
            x: 50,
            y: 250,
            width: 412,
            height: 250,
            fontSize: 18,
            fontWeight: "500",
            color: "#444444",
            textAlign: "left"
          }
        ]
      },
      {
        id: 4,
        bgColor: "#ffffff",
        elements: [
          {
            id: "cl-img-4",
            type: "image",
            src: "/templates/climate_1_new.png",
            x: 0,
            y: 0,
            width: 512,
            height: 576,
            objectFit: "cover"
          },
          {
            id: "cl-t-7",
            type: "text",
            content: "URBAN RESILIENCE",
            x: 562,
            y: 120,
            width: 412,
            height: 120,
            fontSize: 48,
            fontWeight: "900",
            color: "#0c4a6e",
            textAlign: "left"
          },
          {
            id: "cl-t-8",
            type: "text",
            content: "Adapting our cities is paramount. By integrating green infrastructure, porous surfaces, and restorative wetlands, we can create urban environments that not only withstand the changing climate but actively contribute to the restoration of local ecosystems.",
            x: 562,
            y: 250,
            width: 412,
            height: 250,
            fontSize: 18,
            fontWeight: "500",
            color: "#555555",
            textAlign: "left"
          }
        ]
      },
      {
        id: 5,
        bgColor: "#ffffff",
        elements: [
          {
            id: "cl-img-5",
            type: "image",
            src: "/templates/climate_2_new.png",
            x: 512,
            y: 0,
            width: 512,
            height: 576,
            objectFit: "cover"
          },
          {
            id: "cl-t-9",
            type: "text",
            content: "CIRCULAR ECONOMY",
            x: 50,
            y: 120,
            width: 412,
            height: 120,
            fontSize: 48,
            fontWeight: "1000",
            color: "#14532d",
            textAlign: "right"
          },
          {
            id: "cl-t-10",
            type: "text",
            content: "Waste is a design flaw. Transitioning to a circular economy means rethinking how we produce and consume. By designing products for longevity and reuse, we can significantly reduce the pressure on our planet's finite resources.",
            x: 50,
            y: 250,
            width: 412,
            height: 250,
            fontSize: 18,
            fontWeight: "500",
            color: "#666666",
            textAlign: "right"
          }
        ]
      },
      {
        id: 6,
        bgColor: "#ffffff",
        elements: [
          {
            id: "cl-t-11",
            type: "text",
            content: "VOICE OF THE FUTURE",
            x: 0,
            y: 150,
            width: 1024,
            height: 120,
            fontSize: 64,
            fontWeight: "1000",
            color: "#0c4a6e",
            textAlign: "center"
          },
          {
            id: "cl-t-12",
            type: "text",
            content: "Youth activists are leading the way. Their clarity of vision and unwavering commitment to a sustainable world is the primary driver of global policy changes today. We must listen to the generation that will inhabit the world we are building.",
            x: 212,
            y: 320,
            width: 600,
            height: 150,
            fontSize: 22,
            fontWeight: "500",
            color: "#555555",
            textAlign: "center"
          }
        ]
      },
      {
        id: 7,
        bgColor: "#ffffff",
        elements: [
          {
            id: "cl-table-1",
            type: "table",
            tableBgColor: "#ffffff",
            borderColor: "#bae6fd",
            color: "#0c4a6e",
            tableData: [
              [{ text: "Sector", isHeader: true }, { text: "2030 Goal", isHeader: true }, { text: "Reduction Target", isHeader: true }],
              [{ text: "Energy" }, { text: "85% RE" }, { text: "-65%" }],
              [{ text: "Transport" }, { text: "100% EV" }, { text: "-45%" }],
              [{ text: "Industry" }, { text: "Circular" }, { text: "-30%" }],
              [{ text: "Agri" }, { text: "Regen" }, { text: "-20%" }]
            ],
            x: 50,
            y: 100,
            width: 500,
            height: 350
          },
          {
            id: "cl-t-13",
            type: "text",
            content: "SECTORAL TARGETS",
            x: 562,
            y: 120,
            width: 412,
            height: 100,
            fontSize: 44,
            fontWeight: "900",
            color: "#14532d",
            textAlign: "left"
          },
          {
            id: "cl-t-14",
            type: "text",
            content: "Achieving net-zero require aggressive, sector-specific milestones. By focusing on high-impact areas like power generation and transport infrastructure, we can create the necessary momentum for a comprehensive global transition to a sustainable economy.",
            x: 562,
            y: 250,
            width: 412,
            height: 250,
            fontSize: 18,
            fontWeight: "500",
            color: "#555555",
            textAlign: "left"
          }
        ]
      },
      {
        id: 8,
        bgColor: "#ffffff",
        elements: [
          {
            id: "cl-chart-2",
            type: "radial-chart",
            showCard: false,
            color: "#0c4a6e",
            chartTitle: "EMISSION SOURCE REDUCTION",
            chartData: [
              { label: "Energy", value: 80, color: "#0c4a6e" },
              { label: "Transport", value: 60, color: "#075985" },
              { label: "Industry", value: 45, color: "#0369a1" },
              { label: "Agri", value: 30, color: "#0284c7" }
            ],
            x: 50,
            y: 100,
            width: 500,
            height: 350
          },
          {
            id: "cl-t-15",
            type: "text",
            content: "PATH TO NET ZERO",
            x: 562,
            y: 120,
            width: 412,
            height: 120,
            fontSize: 48,
            fontWeight: "900",
            color: "#0c4a6e",
            textAlign: "right"
          },
          {
            id: "cl-t-16",
            type: "text",
            content: "By targeting the most carbon-intensive sectors first, we can achieve meaningful progress. The radial data highlights the significant impact of decarbonizing our electrical grid, which unlocks cascading benefits across transport and industrial production.",
            x: 562,
            y: 270,
            width: 412,
            height: 250,
            fontSize: 18,
            fontWeight: "500",
            color: "#666666",
            textAlign: "right"
          }
        ]
      },
      {
        id: 99,
        bgColor: "#ffffff",
        elements: [
          {
            id: "cl-end-t1",
            type: "text",
            content: "A SUSTAINABLE LEGACY",
            x: 0,
            y: 150,
            width: 1024,
            height: 120,
            fontSize: 64,
            fontWeight: "1000",
            color: "#064e3b",
            textAlign: "center"
          },
          {
            id: "cl-end-t2",
            type: "text",
            content: "Our choices today will define the quality of life for generations to come. Join the movement for a greener, more resilient future.",
            x: 212,
            y: 320,
            width: 600,
            height: 150,
            fontSize: 22,
            fontWeight: "600",
            color: "#059669",
            textAlign: "center"
          }
        ]
      }
    ]
  },
  {
    id: "art-culture",
    title: "Art & Culture",
    description: "A minimalist exploration of classical art and history.",
    thumbnail: "/templates/art_1_new.png",
    slides: [
      {
        id: 0,
        bgColor: "#000000",
        elements: [
          {
            id: "art-welcome-t1",
            type: "text",
            content: "THE ART OF BEING",
            x: 0,
            y: 150,
            width: 1024,
            height: 120,
            fontSize: 72,
            fontWeight: "900",
            color: "#ffffff",
            textAlign: "center"
          },
          {
            id: "art-welcome-t2",
            type: "text",
            content: "A curated journey through the masterworks of human history. Exploring form, function, and feeling.",
            x: 212,
            y: 320,
            width: 600,
            height: 100,
            fontSize: 24,
            fontWeight: "500",
            color: "rgba(255,255,255,0.5)",
            textAlign: "center"
          }
        ]
      },
      {
        id: 1,
        bgColor: "#000000",
        elements: [
          {
            id: "art-img-1",
            type: "image",
            src: "/templates/art_1_new.png",
            x: 512,
            y: 0,
            width: 512,
            height: 576,
            objectFit: "cover"
          },
          {
            id: "art-t-1",
            type: "text",
            content: "CLASSICAL PERFECTION",
            x: 50,
            y: 120,
            width: 412,
            height: 120,
            fontSize: 44,
            fontWeight: "900",
            color: "#ffffff",
            textAlign: "left"
          },
          {
            id: "art-t-2",
            type: "text",
            content: "Michelangelo's David is more than just a statue; it is the ultimate expression of human potential. Captured at the moment of peak concentration, it represents the intellectual and physical prowess that defined the Italian Renaissance.",
            x: 50,
            y: 280,
            width: 412,
            height: 250,
            fontSize: 18,
            fontWeight: "500",
            color: "rgba(255,255,255,0.6)",
            textAlign: "left"
          }
        ]
      },
      {
        id: 2,
        bgColor: "#000000",
        elements: [
          {
            id: "art-img-2",
            type: "image",
            src: "/templates/art_2_new.png",
            x: 0,
            y: 0,
            width: 512,
            height: 576,
            objectFit: "cover"
          },
          {
            id: "art-t-3",
            type: "text",
            content: "THE VISIONARY DRAFT",
            x: 562,
            y: 120,
            width: 412,
            height: 120,
            fontSize: 44,
            fontWeight: "900",
            color: "#ffffff",
            textAlign: "left"
          },
          {
            id: "art-t-4",
            type: "text",
            content: "Before the marble was carved, there was the blueprint. Renaissance masters used intricate perspective lines and geometric precision to plan their works. These drafts are masterpieces in their own right, revealing the rigorous analytical minds behind the art.",
            x: 562,
            y: 280,
            width: 412,
            height: 250,
            fontSize: 18,
            fontWeight: "500",
            color: "rgba(255,255,255,0.6)",
            textAlign: "left"
          }
        ]
      },
      {
        id: 3,
        bgColor: "#000000",
        elements: [
          {
            id: "art-img-3",
            type: "image",
            src: "/templates/art_1_new.png",
            x: 512,
            y: 0,
            width: 512,
            height: 576,
            objectFit: "cover"
          },
          {
            id: "art-t-5",
            type: "text",
            content: "THE RAW CANVAS",
            x: 50,
            y: 120,
            width: 412,
            height: 120,
            fontSize: 44,
            fontWeight: "900",
            color: "#ffffff",
            textAlign: "right"
          },
          {
            id: "art-t-6",
            type: "text",
            content: "Every masterpiece began as a blank slate. The texture of the canvas, the choice of the first stroke, the weight of the pigment—these are the tangible decisions that bridge the gap between imagination and reality.",
            x: 50,
            y: 280,
            width: 412,
            height: 250,
            fontSize: 18,
            fontWeight: "500",
            color: "rgba(255,255,255,0.6)",
            textAlign: "right"
          }
        ]
      },
      {
        id: 4,
        bgColor: "#000000",
        elements: [
          {
            id: "art-img-4",
            type: "image",
            src: "/templates/art_2_new.png",
            x: 0,
            y: 0,
            width: 512,
            height: 576,
            objectFit: "cover"
          },
          {
            id: "art-t-7",
            type: "text",
            content: "ETERNAL PERSPECTIVE",
            x: 562,
            y: 120,
            width: 412,
            height: 120,
            fontSize: 44,
            fontWeight: "900",
            color: "#ffffff",
            textAlign: "left"
          },
          {
            id: "art-t-8",
            type: "text",
            content: "Perspective was the mathematical breakthrough that allowed art to mimic life. By establishing a vanishing point, artists created the illusion of space and depth, a technique that remains the cornerstone of visual storytelling today.",
            x: 562,
            y: 280,
            width: 412,
            height: 250,
            fontSize: 18,
            fontWeight: "500",
            color: "rgba(255,255,255,0.6)",
            textAlign: "left"
          }
        ]
      },
      {
        id: 5,
        bgColor: "#000000",
        elements: [
          {
            id: "art-t-9",
            type: "text",
            content: "CULTURAL SYNERGY",
            x: 0,
            y: 150,
            width: 1024,
            height: 120,
            fontSize: 56,
            fontWeight: "1000",
            color: "#ffffff",
            textAlign: "center"
          },
          {
            id: "art-t-10",
            type: "text",
            content: "Art does not exist in a vacuum. It is the dialogue between cultures, the sharing of techniques across borders, and the collective evolution of the human spirit. Every work is a thread in the vast, interconnected tapestry of history.",
            x: 212,
            y: 320,
            width: 600,
            height: 150,
            fontSize: 22,
            fontWeight: "500",
            color: "rgba(255,255,255,0.5)",
            textAlign: "center"
          }
        ]
      },
      {
        id: 6,
        bgColor: "#ffffff",
        elements: [
          {
            id: "art-t-11",
            type: "text",
            content: "THE DIGITAL RENAISSANCE",
            x: 0,
            y: 150,
            width: 1024,
            height: 120,
            fontSize: 64,
            fontWeight: "1000",
            color: "#000000",
            textAlign: "center"
          },
          {
            id: "art-t-12",
            type: "text",
            content: "Art has entered the age of the algorithm. From AI-generated masterpieces to immersive digital installations, the definition of the 'canvas' is expanding. We are witnessing a new era where human intent meets computational infinite.",
            x: 212,
            y: 320,
            width: 600,
            height: 150,
            fontSize: 22,
            fontWeight: "500",
            color: "#666666",
            textAlign: "center"
          }
        ]
      },
      {
        id: 7,
        bgColor: "#ffffff",
        elements: [
          {
            id: "art-table-1",
            type: "table",
            tableBgColor: "#ffffff",
            borderColor: "#3f3f46",
            color: "#111827",
            tableData: [
              [{ text: "Movement", isHeader: true }, { text: "Period", isHeader: true }, { text: "Key Focus", isHeader: true }],
              [{ text: "Renaissance" }, { text: "14-17c" }, { text: "Humanism/Perspective" }],
              [{ text: "Realism" }, { text: "19c" }, { text: "Daily Truth" }],
              [{ text: "Abstract" }, { text: "20c" }, { text: "Form/Color" }],
              [{ text: "Digital" }, { text: "21c" }, { text: "Algorithms/Code" }]
            ],
            x: 50,
            y: 100,
            width: 500,
            height: 350
          },
          {
            id: "art-t-13",
            type: "text",
            content: "AESTHETIC EPOCHS",
            x: 580,
            y: 120,
            width: 394,
            height: 100,
            fontSize: 44,
            fontWeight: "900",
            color: "#ffffff",
            textAlign: "left"
          },
          {
            id: "art-t-14",
            type: "text",
            content: "The history of art is a sequence of paradigm shifts. Each movement introduced a new way of seeing and representing the world, from the mathematical precision of the Renaissance to the infinite generative possibilities of the digital age.",
            x: 580,
            y: 280,
            width: 394,
            height: 250,
            fontSize: 18,
            fontWeight: "500",
            color: "#666666",
            textAlign: "left"
          }
        ]
      },
      {
        id: 8,
        bgColor: "#000000",
        elements: [
          {
            id: "art-chart-2",
            type: "bar-chart",
            chartTitle: "MUSEUM ENGAGEMENT GROWTH",
            chartData: [
              { label: "Louvre", value: 8.5, color: "#ffffff" },
              { label: "Met", value: 6.2, color: "#ffffff" },
              { label: "British", value: 5.8, color: "#ffffff" },
              { label: "Tate", value: 4.9, color: "#ffffff" }
            ],
            x: 50,
            y: 100,
            width: 500,
            height: 350
          },
          {
            id: "art-t-15",
            type: "text",
            content: "GLOBAL CUSTODIANS",
            x: 580,
            y: 150,
            width: 394,
            height: 60,
            fontSize: 48,
            fontWeight: "900",
            color: "#ffffff",
            textAlign: "right"
          },
          {
            id: "art-t-16",
            type: "text",
            content: "Despite the digital surge, physical museums remain the primary custodians of our collective heritage. Annual attendance at major institutions continues to grow, signaling a deep-seated human need for tangible connection with the artifacts of our past.",
            x: 580,
            y: 260,
            width: 394,
            height: 200,
            fontSize: 18,
            fontWeight: "500",
            color: "rgba(255,255,255,0.6)",
            textAlign: "right"
          }
        ]
      },
      {
        id: 99,
        bgColor: "#000000",
        elements: [
          {
            id: "art-end-t1",
            type: "text",
            content: "INSPIRING THE PRESENT",
            x: 0,
            y: 150,
            width: 1024,
            height: 120,
            fontSize: 56,
            fontWeight: "900",
            color: "#ffffff",
            textAlign: "center"
          },
          {
            id: "art-end-t2",
            type: "text",
            content: "History is not behind us, it's beneath us. Use the lessons of the past to draft your own masterpiece.",
            x: 212,
            y: 320,
            width: 600,
            height: 150,
            fontSize: 22,
            fontWeight: "600",
            color: "rgba(255,255,255,0.4)",
            textAlign: "center"
          }
        ]
      }
    ]
  },
  {
    id: "modern-architecture",
    title: "Modern Architecture",
    description: "Sleek, minimalist architectural presentations.",
    thumbnail: "/templates/arch_1_new.png",
    slides: [
      {
        id: 0,
        bgImage: "/templates/arch_hero_new.png",
        elements: [
          {
            id: "arch-overlay",
            type: "shape",
            shapeType: "rectangle",
            x: 0,
            y: 0,
            width: 1024,
            height: 576,
            color: "#000000",
            opacity: 0.4,
          },
          {
            id: "arch-welcome-t1",
            type: "text",
            content: "THE ARCHITECTURE OF NOW",
            x: 0,
            y: 150,
            width: 1024,
            height: 120,
            fontSize: 64,
            fontWeight: "1000",
            color: "#ffffff",
            textAlign: "center"
          },
          {
            id: "arch-welcome-t2",
            type: "text",
            content: "Minimalism. Precision. Light. A study in the spaces we inhabit and how they shape our lives.",
            x: 212,
            y: 320,
            width: 600,
            height: 100,
            fontSize: 24,
            fontWeight: "500",
            color: "rgba(255,255,255,0.8)",
            textAlign: "center"
          }
        ]
      },
      {
        id: 1,
        bgColor: "#ffffff",
        elements: [
          {
            id: "arch-img-1",
            type: "image",
            src: "/templates/arch_1_new.png",
            x: 512,
            y: 0,
            width: 512,
            height: 576,
            objectFit: "cover"
          },
          {
            id: "arch-t-1",
            type: "text",
            content: "GEOMETRY OF LIGHT",
            x: 50,
            y: 120,
            width: 412,
            height: 120,
            fontSize: 52,
            fontWeight: "900",
            color: "#000000",
            textAlign: "left"
          },
          {
            id: "arch-t-2",
            type: "text",
            content: "Modern skyscraper design is an exercise in structural honesty. By utilizing high-performance glass and reinforced steel, architects create buildings that appear to dissolve into the sky, reflecting the changing light of the day while housing the future of commerce and life.",
            x: 50,
            y: 250,
            width: 412,
            height: 250,
            fontSize: 18,
            fontWeight: "500",
            color: "#666666",
            textAlign: "left"
          }
        ]
      },
      {
        id: 2,
        bgColor: "#ffffff",
        elements: [
          {
            id: "arch-img-2",
            type: "image",
            src: "/templates/arch_2_new.png",
            x: 0,
            y: 0,
            width: 512,
            height: 576,
            objectFit: "cover"
          },
          {
            id: "arch-t-3",
            type: "text",
            content: "THE INNER VOID",
            x: 562,
            y: 120,
            width: 412,
            height: 120,
            fontSize: 52,
            fontWeight: "900",
            color: "#000000",
            textAlign: "left"
          },
          {
            id: "arch-t-4",
            type: "text",
            content: "Interior design in the modernist tradition focus on the 'void'. By using white walls, natural materials, and strategically placed openings, architects create spaces that feel expansive even in small footprints. It is about creating a sanctuary for thought and tranquility.",
            x: 562,
            y: 250,
            width: 412,
            height: 250,
            fontSize: 18,
            fontWeight: "500",
            color: "#666666",
            textAlign: "left"
          }
        ]
      },
      {
        id: 3,
        bgColor: "#ffffff",
        elements: [
          {
            id: "arch-img-3",
            type: "image",
            src: "/templates/arch_1_new.png",
            x: 0,
            y: 0,
            width: 512,
            height: 576,
            objectFit: "cover"
          },
          {
            id: "arch-t-5",
            type: "text",
            content: "STRUCTURAL HONESTY",
            x: 562,
            y: 120,
            width: 412,
            height: 120,
            fontSize: 48,
            fontWeight: "900",
            color: "#000000",
            textAlign: "right"
          },
          {
            id: "arch-t-6",
            type: "text",
            content: "Modernism is about revealing, not concealing. The beauty of a building lies in its truth—the expression of its structure and the clarity of its purpose. When we strip away the ornamental, we find the essential soul of the space.",
            x: 562,
            y: 250,
            width: 412,
            height: 250,
            fontSize: 18,
            fontWeight: "500",
            color: "#666666",
            textAlign: "right"
          }
        ]
      },
      {
        id: 4,
        bgColor: "#ffffff",
        elements: [
          {
            id: "arch-img-4",
            type: "image",
            src: "/templates/arch_2_new.png",
            x: 512,
            y: 0,
            width: 512,
            height: 576,
            objectFit: "cover"
          },
          {
            id: "arch-t-7",
            type: "text",
            content: "ORGANIC MINIMALISM",
            x: 50,
            y: 120,
            width: 412,
            height: 120,
            fontSize: 48,
            fontWeight: "900",
            color: "#000000",
            textAlign: "left"
          },
          {
            id: "arch-t-8",
            type: "text",
            content: "Even in the world of glass and steel, there is room for the organic. By integrating natural wood, stone, and indoor greenery, architects soften the cold edges of modern design, creating environments that feel both futuristic and deeply grounded.",
            x: 50,
            y: 250,
            width: 412,
            height: 250,
            fontSize: 18,
            fontWeight: "500",
            color: "#666666",
            textAlign: "left"
          }
        ]
      },
      {
        id: 5,
        bgColor: "#ffffff",
        elements: [
          {
            id: "arch-t-9",
            type: "text",
            content: "THE SUSTAINABLE VISTA",
            x: 0,
            y: 150,
            width: 1024,
            height: 120,
            fontSize: 56,
            fontWeight: "1000",
            color: "#000000",
            textAlign: "center"
          },
          {
            id: "arch-t-10",
            type: "text",
            content: "Tomorrow's architecture is self-sustaining. From solar-glass facades to rainwater collection systems, the buildings of the future are no longer just consumers of energy—they are active participants in the preservation of our planet.",
            x: 212,
            y: 320,
            width: 600,
            height: 150,
            fontSize: 22,
            fontWeight: "500",
            color: "#666666",
            textAlign: "center"
          }
        ]
      },
      {
        id: 6,
        bgColor: "#000000",
        elements: [
          {
            id: "arch-t-11",
            type: "text",
            content: "URBAN METAMORPHOSIS",
            x: 0,
            y: 150,
            width: 1024,
            height: 120,
            fontSize: 64,
            fontWeight: "1000",
            color: "#ffffff",
            textAlign: "center"
          },
          {
            id: "arch-t-12",
            type: "text",
            content: "Cities are evolving into living organisms. The integration of vertical forests and smart grids is transforming concrete jungles into vibrant, breathable ecosystems that prioritize human well-being and environmental health.",
            x: 212,
            y: 320,
            width: 600,
            height: 150,
            fontSize: 22,
            fontWeight: "500",
            color: "rgba(255,255,255,0.7)",
            textAlign: "center"
          }
        ]
      },
      {
        id: 7,
        bgColor: "#ffffff",
        elements: [
          {
            id: "arch-table-1",
            type: "table",
            tableBgColor: "#ffffff",
            borderColor: "#e5e7eb",
            color: "#111827",
            tableData: [
              [{ text: "Material", isHeader: true }, { text: "Efficiency", isHeader: true }, { text: "Context", isHeader: true }],
              [{ text: "Smart Glass" }, { text: "95%" }, { text: "Dynamic Shading" }],
              [{ text: "Recycled Steel" }, { text: "80%" }, { text: "Structural Core" }],
              [{ text: "Cross-Laminate" }, { text: "90%" }, { text: "Sustainable Framing" }],
              [{ text: "Bio-Concrete" }, { text: "75%" }, { text: "Self-Healing Facades" }]
            ],
            x: 50,
            y: 100,
            width: 500,
            height: 350
          },
          {
            id: "arch-t-13",
            type: "text",
            content: "MATERIAL LOGIC",
            x: 562,
            y: 120,
            width: 412,
            height: 100,
            fontSize: 44,
            fontWeight: "900",
            color: "#000000",
            textAlign: "left"
          },
          {
            id: "arch-t-14",
            type: "text",
            content: "Modern architecture is as much about chemistry as it is about geometry. The selection of materials is driven by a hierarchy of thermal efficiency, structural resilience, and environmental impact, creating a new vernacular of sustainable building.",
            x: 562,
            y: 250,
            width: 412,
            height: 250,
            fontSize: 18,
            fontWeight: "500",
            color: "#666666",
            textAlign: "left"
          }
        ]
      },
      {
        id: 8,
        bgColor: "#000000",
        elements: [
          {
            id: "arch-chart-2",
            type: "area-chart",
            chartTitle: "GREEN SPACE INTEGRATION (%)",
            chartData: [
              { label: "2010", value: 5, color: "#10b981" },
              { label: "2014", value: 12, color: "#10b981" },
              { label: "2018", value: 25, color: "#10b981" },
              { label: "2022", value: 45, color: "#10b981" }
            ],
            x: 50,
            y: 100,
            width: 500,
            height: 350
          },
          {
            id: "arch-t-15",
            type: "text",
            content: "THE BREATHING CITY",
            x: 562,
            y: 150,
            width: 412,
            height: 140,
            fontSize: 48,
            fontWeight: "900",
            color: "#ffffff",
            textAlign: "right"
          },
          {
            id: "arch-t-16",
            type: "text",
            content: "Incorporating nature into deep urban cores is no longer optional. The data shows a massive upward trend in 'biophilic' design, where greenery is treated as a core structural element rather than a secondary aesthetic choice.",
            x: 562,
            y: 320,
            width: 412,
            height: 200,
            fontSize: 18,
            fontWeight: "500",
            color: "rgba(255,255,255,0.6)",
            textAlign: "right"
          }
        ]
      },
      {
        id: 99,
        bgColor: "#ffffff",
        elements: [
          {
            id: "arch-end-t1",
            type: "text",
            content: "DESIGNING TOMORROW",
            x: 0,
            y: 150,
            width: 1024,
            height: 120,
            fontSize: 56,
            fontWeight: "1000",
            color: "#000000",
            textAlign: "center"
          },
          {
            id: "arch-end-t2",
            type: "text",
            content: "The best architectures are those that inspire. Let's build something that lasts. Join the conversation at storyboard.ai.",
            x: 212,
            y: 320,
            width: 600,
            height: 150,
            fontSize: 22,
            fontWeight: "600",
            color: "#94a3b8",
            textAlign: "center"
          }
        ]
      }
    ]
  },
  {
    id: "gourmet-experience",
    title: "Gourmet Experience",
    description: "High-contrast culinary presentations.",
    thumbnail: "/templates/food_1_new.png",
    slides: [
      {
        id: 0,
        bgColor: "#000000",
        elements: [
          {
            id: "food-welcome-t1",
            type: "text",
            content: "A FEAST FOR THE SENSES",
            x: 0,
            y: 150,
            width: 1024,
            height: 120,
            fontSize: 64,
            fontWeight: "1000",
            color: "#ffffff",
            textAlign: "center"
          },
          {
            id: "food-welcome-t2",
            type: "text",
            content: "Exploring the intersection of art, precision, and flavor. A minimalist journey through fine dining.",
            x: 212,
            y: 320,
            width: 600,
            height: 100,
            fontSize: 24,
            fontWeight: "500",
            color: "rgba(255,255,255,0.5)",
            textAlign: "center"
          }
        ]
      },
      {
        id: 1,
        bgColor: "#000000",
        elements: [
          {
            id: "food-img-1",
            type: "image",
            src: "/templates/food_1_new.png",
            x: 450,
            y: 50,
            width: 500,
            height: 476,
            objectFit: "contain"
          },
          {
            id: "food-t-1",
            type: "text",
            content: "CULINARY CRAFT",
            x: 50,
            y: 150,
            width: 350,
            height: 80,
            fontSize: 64,
            fontWeight: "900",
            color: "#ffffff",
            textAlign: "left"
          },
          {
            id: "food-t-2",
            type: "text",
            content: "Gourmet cooking is an art of reduction. By focusing on a single, high-quality ingredient—like a perfectly seared scallop—and pairing it with complementary textures, chefs create a narrative on the plate that celebrates the essence of flavor.",
            x: 50,
            y: 300,
            width: 350,
            height: 250,
            fontSize: 18,
            fontWeight: "500",
            color: "rgba(255,255,255,0.4)",
            textAlign: "left"
          }
        ]
      },
      {
        id: 2,
        bgColor: "#000000",
        elements: [
          {
            id: "food-img-2",
            type: "image",
            src: "/templates/food_2_new.png",
            x: 50,
            y: 50,
            width: 500,
            height: 476,
            objectFit: "contain"
          },
          {
            id: "food-t-3",
            type: "text",
            content: "THE ART OF PLATING",
            x: 600,
            y: 150,
            width: 374,
            height: 80,
            fontSize: 56,
            fontWeight: "900",
            color: "#ffffff",
            textAlign: "right"
          },
          {
            id: "food-t-4",
            type: "text",
            content: "In the kitchen, precision is paramount. Every garnish is placed with surgical intent using tweezers to ensure balance and flow. It is this obsessive attention to detail that transforms a simple meal into a memorably theatrical gourmet experience.",
            x: 600,
            y: 280,
            width: 374,
            height: 250,
            fontSize: 18,
            fontWeight: "500",
            color: "rgba(255,255,255,0.4)",
            textAlign: "right"
          }
        ]
      },
      {
        id: 3,
        bgColor: "#000000",
        elements: [
          {
            id: "food-img-3",
            type: "image",
            src: "/templates/food_1_new.png",
            x: 0,
            y: 0,
            width: 512,
            height: 576,
            objectFit: "cover"
          },
          {
            id: "food-t-5",
            type: "text",
            content: "THE FLAVOR SPECTRUM",
            x: 562,
            y: 120,
            width: 412,
            height: 120,
            fontSize: 48,
            fontWeight: "900",
            color: "#ffffff",
            textAlign: "left"
          },
          {
            id: "food-t-6",
            type: "text",
            content: "Acidity, sweetness, bitterness, salt, and umami. The perfect dish is a delicate balancing act between these five pillars. By understanding how they interact, chefs can guide the diner through a complex emotional journey using only the medium of taste.",
            x: 562,
            y: 250,
            width: 412,
            height: 250,
            fontSize: 18,
            fontWeight: "500",
            color: "rgba(255,255,255,0.4)",
            textAlign: "left"
          }
        ]
      },
      {
        id: 4,
        bgColor: "#000000",
        elements: [
          {
            id: "food-img-4",
            type: "image",
            src: "/templates/food_2_new.png",
            x: 512,
            y: 0,
            width: 512,
            height: 576,
            objectFit: "cover"
          },
          {
            id: "food-t-7",
            type: "text",
            content: "SENSORY ARCHITECTURE",
            x: 50,
            y: 120,
            width: 412,
            height: 120,
            fontSize: 48,
            fontWeight: "900",
            color: "#ffffff",
            textAlign: "right"
          },
          {
            id: "food-t-8",
            type: "text",
            content: "Visuals are the appetizers for the mind. Before the first bite is even taken, the brain has already begun to process the textures and temperatures of the dish. Modern plating is about building an architecture that invites the eye to explore before the tongue confirms.",
            x: 50,
            y: 250,
            width: 412,
            height: 250,
            fontSize: 18,
            fontWeight: "500",
            color: "rgba(255,255,255,0.4)",
            textAlign: "right"
          }
        ]
      },
      {
        id: 5,
        bgColor: "#000000",
        elements: [
          {
            id: "food-t-9",
            type: "text",
            content: "THE SUSTAINABLE HARVEST",
            x: 0,
            y: 150,
            width: 1024,
            height: 120,
            fontSize: 64,
            fontWeight: "1000",
            color: "#ffffff",
            textAlign: "center"
          },
          {
            id: "food-t-10",
            type: "text",
            content: "Great food starts in the soil. The modern gourmet experience is increasingly defined by its connection to the earth. Farm-to-table isn't just a trend; it's a commitment to the quality and history of the ingredients we serve.",
            x: 212,
            y: 320,
            width: 600,
            height: 150,
            fontSize: 22,
            fontWeight: "600",
            color: "rgba(255,255,255,0.5)",
            textAlign: "center"
          }
        ]
      },
      {
        id: 6,
        bgColor: "#000000",
        elements: [
          {
            id: "food-chart-1",
            type: "radar-chart",
            chartTitle: "FLAVOR PROFILE MATRIX",
            chartData: [
              { label: "Sweet", value: 40, color: "#fb923c" },
              { label: "Sour", value: 65, color: "#facc15" },
              { label: "Salty", value: 30, color: "#94a3b8" },
              { label: "Bitter", value: 85, color: "#4ade80" },
              { label: "Umami", value: 100, color: "#f87171" }
            ],
            x: 50,
            y: 100,
            width: 500,
            height: 350
          },
          {
            id: "food-t-11",
            type: "text",
            content: "PALATE PRECISION",
            x: 562,
            y: 150,
            width: 412,
            height: 60,
            fontSize: 44,
            fontWeight: "900",
            color: "#ffffff",
            textAlign: "left"
          },
          {
            id: "food-t-12",
            type: "text",
            content: "Every dish is designed with a specific flavor matrix in mind. The radar chart illustrates the dominant Umami and Bitter profiles of our signature tasting menu, balanced by subtle acidic highlights that cleanse the palate between courses.",
            x: 562,
            y: 270,
            width: 412,
            height: 250,
            fontSize: 18,
            fontWeight: "500",
            color: "rgba(255,255,255,0.6)",
            textAlign: "left"
          }
        ]
      },
      {
        id: 7,
        bgColor: "#ffffff",
        elements: [
          {
            id: "food-table-1",
            type: "table",
            tableBgColor: "#ffffff",
            borderColor: "#e5e7eb",
            color: "#111827",
            tableData: [
              [{ text: "Course", isHeader: true }, { text: "Focus", isHeader: true }, { text: "Pairing", isHeader: true }],
              [{ text: "Amuse" }, { text: "Acid/Texture" }, { text: "Sparkling" }],
              [{ text: "Ocean" }, { text: "Saline/Mineral" }, { text: "Dry White" }],
              [{ text: "Earth" }, { text: "Umami/Depth" }, { text: "Full Red" }],
              [{ text: "Garden" }, { text: "Fresh/Floral" }, { text: "Sweet Wine" }]
            ],
            x: 50,
            y: 100,
            width: 500,
            height: 350
          },
          {
            id: "food-t-13",
            type: "text",
            content: "CURATED PROGRESSION",
            x: 562,
            y: 120,
            width: 412,
            height: 100,
            fontSize: 48,
            fontWeight: "900",
            color: "#14532d",
            textAlign: "right"
          },
          {
            id: "food-t-14",
            type: "text",
            content: "The tasting menu is a carefully composed symphony. Each course transition is designed to reset and then elevate the palate, ensuring that by the final bite, the diner has experienced a complete ideological and sensory narrative.",
            x: 562,
            y: 250,
            width: 412,
            height: 250,
            fontSize: 18,
            fontWeight: "500",
            color: "#444444",
            textAlign: "right"
          }
        ]
      },
      {
        id: 8,
        bgColor: "#000000",
        elements: [
          {
            id: "food-t-15",
            type: "text",
            content: "THE FUTURE OF FLAVOR",
            x: 0,
            y: 180,
            width: 1024,
            height: 100,
            fontSize: 56,
            fontWeight: "1000",
            color: "#ffffff",
            textAlign: "center"
          },
          {
            id: "food-t-16",
            type: "text",
            content: "We are entering a new era of molecular precision and sustainable alternatives. The next decade of fine dining will be defined by our ability to create intense, memorable experiences that are as kind to the planet as they are to the palate.",
            x: 212,
            y: 300,
            width: 600,
            height: 100,
            fontSize: 22,
            fontWeight: "500",
            color: "rgba(255,255,255,0.7)",
            textAlign: "center"
          }
        ]
      },
      {
        id: 99,
        bgColor: "#000000",
        elements: [
          {
            id: "food-end-t1",
            type: "text",
            content: "SAVOR THE MOMENT",
            x: 0,
            y: 150,
            width: 1024,
            height: 120,
            fontSize: 64,
            fontWeight: "1000",
            color: "#ffffff",
            textAlign: "center"
          },
          {
            id: "food-end-t2",
            type: "text",
            content: "Dining is more than just eating; it's an experience to be savored. Discover the story behind every bite.",
            x: 212,
            y: 320,
            width: 600,
            height: 150,
            fontSize: 22,
            fontWeight: "600",
            color: "#fb923c",
            textAlign: "center"
          }
        ]
      }
    ]
  },
  {
    id: "deep-ocean",
    title: "Deep Ocean",
    description: "Vibrant marine life on clean white backgrounds.",
    thumbnail: "/templates/ocean_1_new.png",
    slides: [
      {
        id: 0,
        bgColor: "#ffffff",
        elements: [
          {
            id: "ocean-welcome-t1",
            type: "text",
            content: "THE UNSEEN WORLD",
            x: 0,
            y: 150,
            width: 1024,
            height: 120,
            fontSize: 72,
            fontWeight: "1000",
            color: "#0c4a6e",
            textAlign: "center"
          },
          {
            id: "ocean-welcome-t2",
            type: "text",
            content: "A bright, minimalist journey into the depths of our oceans. Discovering life in its most vibrant forms.",
            x: 212,
            y: 320,
            width: 600,
            height: 100,
            fontSize: 24,
            fontWeight: "500",
            color: "#666666",
            textAlign: "center"
          }
        ]
      },
      {
        id: 1,
        bgColor: "#ffffff",
        elements: [
          {
            id: "ocean-img-1",
            type: "image",
            src: "/templates/ocean_1_new.png",
            x: 0,
            y: 0,
            width: 512,
            height: 576,
            objectFit: "cover"
          },
          {
            id: "ocean-t-1",
            type: "text",
            content: "LIVING COLOR",
            x: 562,
            y: 120,
            width: 412,
            height: 120,
            fontSize: 56,
            fontWeight: "900",
            color: "#0c4a6e",
            textAlign: "left"
          },
          {
            id: "ocean-t-2",
            type: "text",
            content: "Coral reefs are the rainforests of the sea. By isolating these vibrant ecosystems against a clean white backdrop, we highlight the incredible complexity and fragile beauty of the marine life that depends on them for survival.",
            x: 562,
            y: 250,
            width: 412,
            height: 250,
            fontSize: 18,
            fontWeight: "500",
            color: "#666666",
            textAlign: "left"
          }
        ]
      },
      {
        id: 2,
        bgColor: "#ffffff",
        elements: [
          {
            id: "ocean-img-2",
            type: "image",
            src: "/templates/ocean_2_new.png",
            x: 512,
            y: 0,
            width: 512,
            height: 576,
            objectFit: "cover"
          },
          {
            id: "ocean-t-3",
            type: "text",
            content: "THE SILENT GLIDE",
            x: 50,
            y: 120,
            width: 412,
            height: 120,
            fontSize: 56,
            fontWeight: "900",
            color: "#0891b2",
            textAlign: "left"
          },
          {
            id: "ocean-t-4",
            type: "text",
            content: "The sea turtle represents grace and longevity. Swimming through crystal clear turquoise water, these ancient mariners remind us of the vastness and the peaceful stillness that lies just beneath the surface of the rolling waves.",
            x: 50,
            y: 250,
            width: 412,
            height: 250,
            fontSize: 18,
            fontWeight: "500",
            color: "#666666",
            textAlign: "left"
          }
        ]
      },
      {
        id: 3,
        bgColor: "#ffffff",
        elements: [
          {
            id: "ocean-img-3",
            type: "image",
            src: "/templates/ocean_1_new.png",
            x: 512,
            y: 0,
            width: 512,
            height: 576,
            objectFit: "cover"
          },
          {
            id: "ocean-t-5",
            type: "text",
            content: "THE NEON DEPTHS",
            x: 50,
            y: 120,
            width: 412,
            height: 120,
            fontSize: 48,
            fontWeight: "900",
            color: "#0891b2",
            textAlign: "right"
          },
          {
            id: "ocean-t-6",
            type: "text",
            content: "In the midnight zone, bioluminescence is the only light. Creatures have evolved to create their own neon glows, turning the pitch-black water into a spectacular display of organic neon. It is a world where light is a language, used for both attraction and distraction.",
            x: 50,
            y: 250,
            width: 412,
            height: 250,
            fontSize: 18,
            fontWeight: "500",
            color: "#666666",
            textAlign: "right"
          }
        ]
      },
      {
        id: 4,
        bgColor: "#ffffff",
        elements: [
          {
            id: "ocean-img-4",
            type: "image",
            src: "/templates/ocean_2_new.png",
            x: 0,
            y: 0,
            width: 512,
            height: 576,
            objectFit: "cover"
          },
          {
            id: "ocean-t-7",
            type: "text",
            content: "ANCIENT VOYAGERS",
            x: 562,
            y: 120,
            width: 412,
            height: 120,
            fontSize: 48,
            fontWeight: "900",
            color: "#0e7490",
            textAlign: "left"
          },
          {
            id: "ocean-t-8",
            type: "text",
            content: "Sea turtles have navigated the currents for over 100 million years. Their journey is a testament to resilience, crossing entire oceans to return to the same beaches where they were born. Protecting their migratory paths is essential for the health of our global marine ecosystems.",
            x: 562,
            y: 250,
            width: 412,
            height: 250,
            fontSize: 18,
            fontWeight: "500",
            color: "#666666",
            textAlign: "left"
          }
        ]
      },
      {
        id: 5,
        bgColor: "#ffffff",
        elements: [
          {
            id: "ocean-t-9",
            type: "text",
            content: "THE BLUE LUNG",
            x: 0,
            y: 180,
            width: 1024,
            height: 100,
            fontSize: 56,
            fontWeight: "1000",
            color: "#0c4a6e",
            textAlign: "center"
          },
          {
            id: "ocean-t-10",
            type: "text",
            content: "The ocean provides more than half of the world's oxygen. Through the action of phytoplankton and the vast cycles of the deep, the sea breathes for us. When we protect the blue heart of our planet, we are protecting the very air we breathe.",
            x: 212,
            y: 300,
            width: 600,
            height: 100,
            fontSize: 22,
            fontWeight: "600",
            color: "#666666",
            textAlign: "center"
          }
        ]
      },
      {
        id: 6,
        bgColor: "#ffffff",
        elements: [
          {
            id: "ocean-table-1",
            type: "table",
            tableBgColor: "#ffffff",
            borderColor: "#bae6fd",
            color: "#0c4a6e",
            tableData: [
              [{ text: "Zone", isHeader: true }, { text: "Depth", isHeader: true }, { text: "Species", isHeader: true }],
              [{ text: "Sunlight" }, { text: "0-200m" }, { text: "Dolphins/Reefs" }],
              [{ text: "Twilight" }, { text: "200-1000m" }, { text: "Squid/Swordfish" }],
              [{ text: "Midnight" }, { text: "1000-4000m" }, { text: "Anglerfish" }],
              [{ text: "Abyss" }, { text: "4000m+" }, { text: "Sea Spiders" }]
            ],
            x: 50,
            y: 100,
            width: 500,
            height: 350
          },
          {
            id: "ocean-t-11",
            type: "text",
            content: "VERTICAL BIOMES",
            x: 562,
            y: 120,
            width: 412,
            height: 100,
            fontSize: 44,
            fontWeight: "900",
            color: "#0c4a6e",
            textAlign: "left"
          },
          {
            id: "ocean-t-12",
            type: "text",
            content: "Life adapt radically as depth increases. Each zone represents a unique environmental challenge, from the high-energy, light-filled surface waters to the crushing pressures and absolute darkness of the deep ocean trenches.",
            x: 562,
            y: 250,
            width: 412,
            height: 250,
            fontSize: 18,
            fontWeight: "500",
            color: "#666666",
            textAlign: "left"
          }
        ]
      },
      {
        id: 7,
        bgColor: "#ffffff",
        elements: [
          {
            id: "ocean-chart-2",
            type: "pie-chart",
            showCard: false,
            color: "#0c4a6e",
            chartTitle: "OCEAN PLASTIC SOURCES",
            chartData: [
              { label: "Land-based", value: 80, color: "#0891b2" },
              { label: "Maritime", value: 20, color: "#0e7490" }
            ],
            x: 50,
            y: 100,
            width: 450,
            height: 350
          },
          {
            id: "ocean-t-13",
            type: "text",
            content: "THE PLASTIC BURDEN",
            x: 562,
            y: 150,
            width: 412,
            height: 100,
            fontSize: 48,
            fontWeight: "900",
            color: "#0e7490",
            textAlign: "right"
          },
          {
            id: "ocean-t-14",
            type: "text",
            content: "The majority of ocean plastic originates from land-based sources. Solving the deep-sea crisis begins with rethinking our relationship with single-use plastics and improving waste management systems in our coastal cities.",
            x: 562,
            y: 280,
            width: 412,
            height: 200,
            fontSize: 18,
            fontWeight: "500",
            color: "#666666",
            textAlign: "right"
          }
        ]
      },
      {
        id: 8,
        bgColor: "#ffffff",
        elements: [
          {
            id: "ocean-t-15",
            type: "text",
            content: "THE ABYSSAL MIRROR",
            x: 0,
            y: 180,
            width: 1024,
            height: 100,
            fontSize: 56,
            fontWeight: "1000",
            color: "#0c4a6e",
            textAlign: "center"
          },
          {
            id: "ocean-t-16",
            type: "text",
            content: "The deep ocean is a mirror of our activity on the surface. From rising temperatures to the presence of microplastics in the deepest trenches, the health of the abyss is inextricably linked to our own. To save the ocean is to save ourselves.",
            x: 212,
            y: 300,
            width: 600,
            height: 100,
            fontSize: 22,
            fontWeight: "500",
            color: "#666666",
            textAlign: "center"
          }
        ]
      },
      {
        id: 99,
        bgColor: "#ffffff",
        elements: [
          {
            id: "ocean-end-t1",
            type: "text",
            content: "PRESERVING THE DEPTHS",
            x: 0,
            y: 180,
            width: 1024,
            height: 100,
            fontSize: 56,
            fontWeight: "1000",
            color: "#0e7490",
            textAlign: "center"
          },
          {
            id: "ocean-end-t2",
            type: "text",
            content: "Our actions on land define the future of the deep. Join us in protecting the wonders of the underwater world.",
            x: 212,
            y: 300,
            width: 600,
            height: 80,
            fontSize: 22,
            fontWeight: "600",
            color: "#67e8f9",
            textAlign: "center"
          }
        ]
      }
    ]
  },
  {
    id: "mindful-living",
    title: "Mindful Living",
    description: "Calm, minimalist layouts for wellness and meditation.",
    thumbnail: "/templates/mind_1_new.png",
    slides: [
      {
        id: 0,
        bgColor: "#ffffff",
        elements: [
          {
            id: "mind-welcome-t1",
            type: "text",
            content: "THE ART OF STILLNESS",
            x: 0,
            y: 150,
            width: 1024,
            height: 120,
            fontSize: 72,
            fontWeight: "1000",
            color: "#444444",
            textAlign: "center"
          },
          {
            id: "mind-welcome-t2",
            type: "text",
            content: "A guide to finding calm in the chaos. Minimalist visuals designed to inspire presence and peace.",
            x: 212,
            y: 320,
            width: 600,
            height: 100,
            fontSize: 24,
            fontWeight: "400",
            color: "#888888",
            textAlign: "center"
          }
        ]
      },
      {
        id: 1,
        bgColor: "#ffffff",
        elements: [
          {
            id: "mind-img-1",
            type: "image",
            src: "/templates/mind_1_new.png",
            x: 50,
            y: 50,
            width: 500,
            height: 476,
            objectFit: "contain"
          },
          {
            id: "mind-t-1",
            type: "text",
            content: "PERFECT BALANCE",
            x: 600,
            y: 150,
            width: 374,
            height: 80,
            fontSize: 56,
            fontWeight: "900",
            color: "#444444",
            textAlign: "right"
          },
          {
            id: "mind-t-2",
            type: "text",
            content: "Stability is not a destination, but a practice. Like a carefully balanced stack of river stones, our well-being requires intent and focus. By simplifying our surroundings, we create the negative space necessary for the mind to settle.",
            x: 550,
            y: 260,
            width: 424,
            height: 250,
            fontSize: 18,
            fontWeight: "400",
            color: "#999999",
            textAlign: "right"
          }
        ]
      },
      {
        id: 2,
        bgColor: "#ffffff",
        elements: [
          {
            id: "mind-img-2",
            type: "image",
            src: "/templates/mind_2_new.png",
            x: 0,
            y: 0,
            width: 512,
            height: 576,
            objectFit: "cover"
          },
          {
            id: "mind-t-3",
            type: "text",
            content: "MINDFUL FOCUS",
            x: 562,
            y: 120,
            width: 412,
            height: 120,
            fontSize: 56,
            fontWeight: "900",
            color: "#555555",
            textAlign: "left"
          },
          {
            id: "mind-t-4",
            type: "text",
            content: "The Mudra is a symbolic gesture used in meditation to focus the mind. By bringing attention to the body through such simple, ancient practices, we anchor ourselves in the present moment, letting go of the noise of the past and future.",
            x: 562,
            y: 250,
            width: 412,
            height: 250,
            fontSize: 18,
            fontWeight: "400",
            color: "#888888",
            textAlign: "left"
          }
        ]
      },
      {
        id: 3,
        bgColor: "#ffffff",
        elements: [
          {
            id: "mind-img-3",
            type: "image",
            src: "/templates/mind_1_new.png",
            x: 0,
            y: 0,
            width: 512,
            height: 576,
            objectFit: "cover"
          },
          {
            id: "mind-t-5",
            type: "text",
            content: "NATURAL SYMPHONY",
            x: 562,
            y: 120,
            width: 412,
            height: 120,
            fontSize: 48,
            fontWeight: "900",
            color: "#444444",
            textAlign: "right"
          },
          {
            id: "mind-t-6",
            type: "text",
            content: "Nature doesn't hurry, yet everything is accomplished. By spending time in green spaces, we recalibrate our internal clocks to the slower, restorative rhythms of the natural world. It is the most direct path to reducing stress and reclaiming our attention.",
            x: 562,
            y: 250,
            width: 412,
            height: 250,
            fontSize: 18,
            fontWeight: "400",
            color: "#999999",
            textAlign: "right"
          }
        ]
      },
      {
        id: 4,
        bgColor: "#ffffff",
        elements: [
          {
            id: "mind-img-4",
            type: "image",
            src: "/templates/mind_2_new.png",
            x: 512,
            y: 0,
            width: 512,
            height: 576,
            objectFit: "cover"
          },
          {
            id: "mind-t-7",
            type: "text",
            content: "DIGITAL DETOX",
            x: 50,
            y: 120,
            width: 412,
            height: 120,
            fontSize: 48,
            fontWeight: "900",
            color: "#555555",
            textAlign: "left"
          },
          {
            id: "mind-t-8",
            type: "text",
            content: "The constant pings of the digital world are a drain on our finite cognitive resources. A mindful life requires intentional periods of disconnection. By putting down the screen, we pick up the richness of the immediate, physical world around us.",
            x: 50,
            y: 250,
            width: 412,
            height: 250,
            fontSize: 18,
            fontWeight: "400",
            color: "#888888",
            textAlign: "left"
          }
        ]
      },
      {
        id: 5,
        bgColor: "#ffffff",
        elements: [
          {
            id: "mind-t-9",
            type: "text",
            content: "THE POWER OF BREATH",
            x: 0,
            y: 180,
            width: 1024,
            height: 100,
            fontSize: 56,
            fontWeight: "1000",
            color: "#666666",
            textAlign: "center"
          },
          {
            id: "mind-t-10",
            type: "text",
            content: "The breath is the bridge between the mind and the body. By simply observing the inhalation and exhalation, we can trigger the body's relaxation response, bringing immediate calm to even the most turbulent moments of our lives.",
            x: 212,
            y: 320,
            width: 600,
            height: 150,
            fontSize: 22,
            fontWeight: "500",
            color: "#a1a1aa",
            textAlign: "center"
          }
        ]
      },
      {
        id: 6,
        bgColor: "#ffffff",
        elements: [
          {
            id: "mind-t-11",
            type: "text",
            content: "THE RIPPLE EFFECT",
            x: 0,
            y: 180,
            width: 1024,
            height: 100,
            fontSize: 64,
            fontWeight: "1000",
            color: "#444444",
            textAlign: "center"
          },
          {
            id: "mind-t-12",
            type: "text",
            content: "Mindfulness is not an isolated act. When we cultivate peace within ourselves, it ripples outward, affecting our relationships, our work, and the world around us. A single moment of presence can transform an entire day.",
            x: 212,
            y: 320,
            width: 600,
            height: 150,
            fontSize: 22,
            fontWeight: "400",
            color: "#888888",
            textAlign: "center"
          }
        ]
      },
      {
        id: 7,
        bgColor: "#ffffff",
        elements: [
          {
            id: "mind-table-1",
            type: "table",
            tableBgColor: "#ffffff",
            borderColor: "#e4e4e7",
            color: "#444444",
            tableData: [
              [{ text: "Time", isHeader: true }, { text: "Activity", isHeader: true }, { text: "Goal", isHeader: true }],
              [{ text: "06:00" }, { text: "Meditation" }, { text: "Stillness" }],
              [{ text: "07:30" }, { text: "Mindful Walk" }, { text: "Connection" }],
              [{ text: "12:00" }, { text: "Silent Meal" }, { text: "Gratitude" }],
              [{ text: "21:00" }, { text: "Reflection" }, { text: "Closure" }]
            ],
            x: 50,
            y: 100,
            width: 500,
            height: 350
          },
          {
            id: "mind-t-13",
            type: "text",
            content: "A DAILY RHYTHM",
            x: 562,
            y: 120,
            width: 412,
            height: 100,
            fontSize: 44,
            fontWeight: "900",
            color: "#444444",
            textAlign: "left"
          },
          {
            id: "mind-t-14",
            type: "text",
            content: "Mindfulness is woven into the fabric of the day. By establishing core anchors of presence, we create a stable emotional foundation that allows us to navigate the complexities of modern life with grace and intentionality.",
            x: 562,
            y: 250,
            width: 412,
            height: 250,
            fontSize: 18,
            fontWeight: "400",
            color: "#666666",
            textAlign: "left"
          }
        ]
      },
      {
        id: 8,
        bgColor: "#ffffff",
        elements: [
          {
            id: "mind-chart-2",
            type: "line-chart",
            showCard: false,
            color: "#444444",
            chartTitle: "MINDFULNESS INTEREST INDEX",
            chartData: [
              { label: "2015", value: 20, color: "#94a3b8" },
              { label: "2017", value: 40, color: "#94a3b8" },
              { label: "2019", value: 65, color: "#94a3b8" },
              { label: "2021", value: 90, color: "#94a3b8" },
              { label: "2023", value: 110, color: "#94a3b8" }
            ],
            x: 50,
            y: 100,
            width: 500,
            height: 350
          },
          {
            id: "mind-t-15",
            type: "text",
            content: "GLOBAL AWAKENING",
            x: 562,
            y: 150,
            width: 412,
            height: 100,
            fontSize: 48,
            fontWeight: "900",
            color: "#444444",
            textAlign: "right"
          },
          {
            id: "mind-t-16",
            type: "text",
            content: "Interest in mindfulness and mental health has reached a historic peak. As the world becomes increasingly complex, the collective value placed on internal stability and mental clarity continues to rise across all demographics.",
            x: 562,
            y: 280,
            width: 412,
            height: 200,
            fontSize: 18,
            fontWeight: "400",
            color: "#666666",
            textAlign: "right"
          }
        ]
      },
      {
        id: 99,
        bgColor: "#ffffff",
        elements: [
          {
            id: "mind-end-t1",
            type: "text",
            content: "BREATHE IN THE PRESENT",
            x: 0,
            y: 180,
            width: 1024,
            height: 100,
            fontSize: 56,
            fontWeight: "1000",
            color: "#666666",
            textAlign: "center"
          },
          {
            id: "mind-end-t2",
            type: "text",
            content: "Your journey to mindfulness continues with every breath. Find your center today at storyboard.ai.",
            x: 212,
            y: 300,
            width: 600,
            height: 80,
            fontSize: 22,
            fontWeight: "500",
            color: "#a1a1aa",
            textAlign: "center"
          }
        ]
      }
    ]
  },
  {
    id: "global-analytics",
    title: "Global Analytics",
    description: "Data-driven presentation with advanced charting and minimalist design.",
    thumbnail: "/templates/analytics_hero.png",
    slides: [
      {
        id: 0,
        bgColor: "#000000",
        elements: [
          {
            id: "ga-welcome-t1",
            type: "text",
            content: "INSIGHTS. DRIVEN.",
            x: 0,
            y: 150,
            width: 1024,
            height: 120,
            fontSize: 72,
            fontWeight: "1000",
            color: "#ffffff",
            textAlign: "center"
          },
          {
            id: "ga-welcome-t2",
            type: "text",
            content: "Empowering decision-making through high-fidelity data visualization and streamlined analytics.",
            x: 212,
            y: 320,
            width: 600,
            height: 100,
            fontSize: 24,
            fontWeight: "500",
            color: "rgba(255,255,255,0.6)",
            textAlign: "center"
          }
        ]
      },
      {
        id: 1,
        bgColor: "#ffffff",
        elements: [
          {
            id: "ga-chart-1",
            type: "bar-chart",
            showCard: false,
            color: "#000000",
            chartTitle: "QUARTERLY GROWTH",
            chartData: [
              { label: "Q1", value: 400, color: "#3b82f6" },
              { label: "Q2", value: 600, color: "#2563eb" },
              { label: "Q3", value: 800, color: "#1d4ed8" },
              { label: "Q4", value: 1100, color: "#1e40af" }
            ],
            x: 50,
            y: 100,
            width: 500,
            height: 350
          },
          {
            id: "ga-t-1",
            type: "text",
            content: "MARKET ASCENSION",
            x: 600,
            y: 150,
            width: 374,
            height: 60,
            fontSize: 48,
            fontWeight: "900",
            color: "#000000",
            textAlign: "right"
          },
          {
            id: "ga-t-2",
            type: "text",
            content: "We observed a consistent 25% month-over-month increase in market penetration. The fourth quarter surpassed all previous benchmarks, driven by our regional expansion strategy.",
            x: 550,
            y: 270,
            width: 424,
            height: 250,
            fontSize: 18,
            fontWeight: "500",
            color: "#666666",
            textAlign: "right"
          }
        ]
      },
      {
        id: 2,
        bgColor: "#000000",
        elements: [
          {
            id: "ga-chart-2",
            type: "area-chart",
            chartTitle: "USER ENGAGEMENT TRENDS",
            chartData: [
              { label: "Jan", value: 200 },
              { label: "Feb", value: 450 },
              { label: "Mar", value: 400 },
              { label: "Apr", value: 600 },
              { label: "May", value: 800 },
              { label: "Jun", value: 950 }
            ],
            color: "#10b981",
            x: 474,
            y: 100,
            width: 500,
            height: 350
          },
          {
            id: "ga-t-3",
            type: "text",
            content: "PEAK VELOCITY",
            x: 50,
            y: 150,
            width: 412,
            height: 60,
            fontSize: 48,
            fontWeight: "900",
            color: "#ffffff",
            textAlign: "left"
          },
          {
            id: "ga-t-4",
            type: "text",
            content: "Active user sessions have reached an all-time high. Our engagement depth has tripled compared to H1 2023, signaling high product-market fit and retention reliability.",
            x: 50,
            y: 270,
            width: 412,
            height: 250,
            fontSize: 18,
            fontWeight: "500",
            color: "rgba(255,255,255,0.7)",
            textAlign: "left"
          }
        ]
      },
      {
        id: 3,
        bgColor: "#ffffff",
        elements: [
          {
            id: "ga-chart-3",
            type: "pie-chart",
            showCard: false,
            color: "#000000",
            chartTitle: "REVENUE DISTRIBUTION",
            chartData: [
              { label: "SaaS", value: 45, color: "#6366f1" },
              { label: "Services", value: 25, color: "#8b5cf6" },
              { label: "License", value: 20, color: "#a855f7" },
              { label: "Support", value: 10, color: "#d946ef" }
            ],
            x: 50,
            y: 100,
            width: 450,
            height: 350
          },
          {
            id: "ga-chart-4",
            type: "line-chart",
            showCard: false,
            color: "#000000",
            chartTitle: "RETENTION RATE",
            chartData: [
              { label: "M1", value: 100 },
              { label: "M2", value: 85 },
              { label: "M3", value: 80 },
              { label: "M4", value: 78 },
              { label: "M5", value: 76 },
              { label: "M6", value: 75 }
            ],
            x: 524,
            y: 100,
            width: 450,
            height: 350
          }
        ]
      },
      {
        id: 4,
        bgColor: "#000000",
        elements: [
          {
            id: "ga-chart-5",
            type: "radar-chart",
            chartTitle: "REGIONAL PERFORMANCE",
            chartData: [
              { label: "NA", value: 85, color: "#3b82f6" },
              { label: "EU", value: 70, color: "#10b981" },
              { label: "APAC", value: 95, color: "#f59e0b" },
              { label: "LATAM", value: 45, color: "#ef4444" },
              { label: "ME", value: 60, color: "#8b5cf6" }
            ],
            x: 50,
            y: 100,
            width: 500,
            height: 350
          },
          {
            id: "ga-t-5",
            type: "text",
            content: "GLOBAL FOOTPRINT",
            x: 562,
            y: 150,
            width: 412,
            height: 60,
            fontSize: 44,
            fontWeight: "900",
            color: "#ffffff",
            textAlign: "left"
          },
          {
            id: "ga-t-6",
            type: "text",
            content: "Our APAC operations are currently leading in growth efficiency. The radar matrix reveals a strong correlation between localized support and user retention across all high-performing regions.",
            x: 562,
            y: 270,
            width: 412,
            height: 250,
            fontSize: 18,
            fontWeight: "500",
            color: "rgba(255,255,255,0.7)",
            textAlign: "left"
          }
        ]
      },
      {
        id: 5,
        bgColor: "#ffffff",
        elements: [
          {
            id: "ga-chart-6",
            type: "radial-chart",
            showCard: false,
            color: "#000000",
            chartTitle: "ACQUISITION CHANNELS",
            chartData: [
              { label: "Direct", value: 45, color: "#2563eb" },
              { label: "Search", value: 30, color: "#3b82f6" },
              { label: "Social", value: 15, color: "#60a5fa" },
              { label: "Referral", value: 10, color: "#93c5fd" }
            ],
            x: 474,
            y: 100,
            width: 500,
            height: 350
          },
          {
            id: "ga-t-7",
            type: "text",
            content: "ORGANIC MOMENTUM",
            x: 50,
            y: 150,
            width: 412,
            height: 100,
            fontSize: 48,
            fontWeight: "900",
            color: "#000000",
            textAlign: "right"
          },
          {
            id: "ga-t-8",
            type: "text",
            content: "Direct traffic remains our strongest channel, accounting for nearly half of all new acquisitions. This indicates strong brand recall and a robust word-of-mouth ecosystem.",
            x: 50,
            y: 280,
            width: 412,
            height: 200,
            fontSize: 18,
            fontWeight: "500",
            color: "#666666",
            textAlign: "right"
          }
        ]
      },
      {
        id: 6,
        bgColor: "#000000",
        elements: [
          {
            id: "ga-t-9",
            type: "text",
            content: "FORECASTED TRAJECTORY",
            x: 0,
            y: 150,
            width: 1024,
            height: 120,
            fontSize: 64,
            fontWeight: "1000",
            color: "#ffffff",
            textAlign: "center"
          },
          {
            id: "ga-t-10",
            type: "text",
            content: "Based on the current velocity, we project a 40% increase in enterprise-tier adoption by EOY. Our data models suggest that the synergy between new feature releases and regional marketing will produce a compounded growth effect.",
            x: 212,
            y: 320,
            width: 600,
            height: 200,
            fontSize: 22,
            fontWeight: "500",
            color: "rgba(255,255,255,0.6)",
            textAlign: "center"
          }
        ]
      },
      {
        id: 7,
        bgColor: "#ffffff",
        elements: [
          {
            id: "ga-table-1",
            type: "table",
            tableBgColor: "#ffffff",
            borderColor: "#e2e8f0",
            color: "#0f172a",
            tableData: [
              [{ text: "Sector", isHeader: true }, { text: "Efficiency", isHeader: true }, { text: "ROI", isHeader: true }],
              [{ text: "Fintech" }, { text: "95%" }, { text: "4.2x" }],
              [{ text: "Health" }, { text: "80%" }, { text: "2.8x" }],
              [{ text: "SaaS" }, { text: "70%" }, { text: "3.5x" }],
              [{ text: "Retail" }, { text: "45%" }, { text: "1.9x" }]
            ],
            x: 50,
            y: 100,
            width: 500,
            height: 350
          },
          {
            id: "ga-t-11",
            type: "text",
            content: "PERFORMANCE MATRIX",
            x: 562,
            y: 120,
            width: 412,
            height: 100,
            fontSize: 44,
            fontWeight: "900",
            color: "#000000",
            textAlign: "left"
          },
          {
            id: "ga-t-12",
            type: "text",
            content: "Across every vertical, our integration delivers measurable gains. Fintech remains the clear leader in efficiency realization, while health and SaaS sectors show the most significant year-over-year ROI improvements.",
            x: 562,
            y: 250,
            width: 412,
            height: 250,
            fontSize: 18,
            fontWeight: "500",
            color: "#666666",
            textAlign: "left"
          }
        ]
      },
      {
        id: 8,
        bgColor: "#000000",
        elements: [
          {
            id: "ga-chart-8",
            type: "area-chart",
            chartTitle: "OPERATIONAL EFFICIENCY INDEX",
            chartData: [
              { label: "Jan", value: 45, color: "#3b82f6" },
              { label: "Feb", value: 50, color: "#3b82f6" },
              { label: "Mar", value: 65, color: "#3b82f6" },
              { label: "Apr", value: 85, color: "#3b82f6" }
            ],
            x: 512,
            y: 100,
            width: 450,
            height: 350
          },
          {
            id: "ga-t-13",
            type: "text",
            content: "SCALING THROUGHPUT",
            x: 50,
            y: 150,
            width: 412,
            height: 60,
            fontSize: 48,
            fontWeight: "900",
            color: "#ffffff",
            textAlign: "right"
          },
          {
            id: "ga-t-14",
            type: "text",
            content: "The transition to our V2 architecture has produced a step-function increase in operational efficiency. We are now processing double the workload with 30% fewer resources compared to the same period last year.",
            x: 50,
            y: 270,
            width: 412,
            height: 250,
            fontSize: 18,
            fontWeight: "500",
            color: "rgba(255,255,255,0.6)",
            textAlign: "right"
          }
        ]
      },
      {
        id: 99,
        bgColor: "#000000",
        elements: [
          {
            id: "ga-end-t1",
            type: "text",
            content: "THE DATA REVOLUTION",
            x: 0,
            y: 150,
            width: 1024,
            height: 120,
            fontSize: 56,
            fontWeight: "1000",
            color: "#ffffff",
            textAlign: "center"
          },
          {
            id: "ga-end-t2",
            type: "text",
            content: "Thank you for joining our deep dive into world-class analytics.",
            x: 212,
            y: 320,
            width: 600,
            height: 150,
            fontSize: 22,
            fontWeight: "600",
            color: "#3b82f6",
            textAlign: "center"
          }
        ]
      }
    ]
  },
  {
    id: "performance-matrix",
    title: "Performance Matrix",
    description: "Compare and contrast core metrics using unconventional chart types.",
    thumbnail: "/templates/performance_hero.png",
    slides: [
      {
        id: 0,
        bgColor: "#ffffff",
        elements: [
          {
            id: "pm-welcome-t1",
            type: "text",
            content: "CORE CAPACITY",
            x: 0,
            y: 150,
            width: 1024,
            height: 120,
            fontSize: 72,
            fontWeight: "1000",
            color: "#000000",
            textAlign: "center"
          },
          {
            id: "pm-welcome-t2",
            type: "text",
            content: "A detailed comparison of operational performance across multiple dimensions of efficiency.",
            x: 212,
            y: 320,
            width: 600,
            height: 100,
            fontSize: 24,
            fontWeight: "500",
            color: "#666666",
            textAlign: "center"
          }
        ]
      },
      {
        id: 1,
        bgColor: "#000000",
        elements: [
          {
            id: "pm-chart-1",
            type: "radar-chart",
            showCard: false,
            color: "#ffffff",
            chartTitle: "COMPETENCE OVERVIEW",
            chartData: [
              { label: "Speed", value: 85 },
              { label: "Stability", value: 90 },
              { label: "Safety", value: 95 },
              { label: "UX", value: 70 },
              { label: "Scale", value: 80 }
            ],
            x: 50,
            y: 100,
            width: 500,
            height: 400
          },
          {
            id: "pm-t-1",
            type: "text",
            content: "MULTI-DIMENSIONAL EXCELLENCE",
            x: 600,
            y: 150,
            width: 374,
            height: 100,
            fontSize: 48,
            fontWeight: "900",
            color: "#ffffff",
            textAlign: "right"
          },
          {
            id: "pm-t-2",
            type: "text",
            content: "Our system excels in safety and stability, maintaining high-tier performance even under peak loads. User experience remains our primary focus for next-quarter optimizations.",
            x: 550,
            y: 280,
            width: 424,
            height: 250,
            fontSize: 18,
            fontWeight: "500",
            color: "rgba(255,255,255,0.7)",
            textAlign: "right"
          }
        ]
      },
      {
        id: 2,
        bgColor: "#ffffff",
        elements: [
          {
            id: "pm-chart-2",
            type: "radial-chart",
            showCard: false,
            color: "#000000",
            chartTitle: "RESOURCE ALLOCATION",
            chartData: [
              { label: "Infra", value: 40, color: "#ef4444" },
              { label: "R&D", value: 30, color: "#3b82f6" },
              { label: "Ops", value: 20, color: "#10b981" },
              { label: "Misc", value: 10, color: "#f59e0b" }
            ],
            x: 474,
            y: 50,
            width: 500,
            height: 450
          },
          {
            id: "pm-t-3",
            type: "text",
            content: "PRECISION SPENDING",
            x: 50,
            y: 150,
            width: 412,
            height: 60,
            fontSize: 48,
            fontWeight: "900",
            color: "#000000",
            textAlign: "left"
          },
          {
            id: "pm-t-4",
            type: "text",
            content: "Capital allocation is heavily weighted towards infrastructure and R&D, ensuring a competitive moat through technical superiority and innovation velocity.",
            x: 50,
            y: 270,
            width: 412,
            height: 250,
            fontSize: 18,
            fontWeight: "500",
            color: "#666666",
            textAlign: "left"
          }
        ]
      },
      {
        id: 3,
        bgColor: "#000000",
        elements: [
          {
            id: "pm-chart-3",
            type: "bar-chart",
            chartTitle: "LATENCY REDUCTION",
            chartData: [
              { label: "v1.0", value: 450, color: "#94a3b8" },
              { label: "v1.2", value: 380, color: "#64748b" },
              { label: "v1.5", value: 210, color: "#475569" },
              { label: "v2.0", value: 95, color: "#f59e0b" }
            ],
            x: 512,
            y: 100,
            width: 450,
            height: 350
          },
          {
            id: "pm-t-5",
            type: "text",
            content: "ENGINEERING VELOCITY",
            x: 50,
            y: 150,
            width: 412,
            height: 60,
            fontSize: 44,
            fontWeight: "900",
            color: "#ffffff",
            textAlign: "right"
          },
          {
            id: "pm-t-6",
            type: "text",
            content: "Each iteration of our core engine has brought significant performance gains. The jump to v2.0 represents a architectural paradigm shift, reducing request latency by over 75%.",
            x: 50,
            y: 270,
            width: 412,
            height: 250,
            fontSize: 18,
            fontWeight: "500",
            color: "rgba(255,255,255,0.7)",
            textAlign: "right"
          }
        ]
      },
      {
        id: 4,
        bgColor: "#ffffff",
        elements: [
          {
            id: "pm-chart-4",
            type: "line-chart",
            showCard: false,
            color: "#000000",
            chartTitle: "UPTIME ACCURACY",
            chartData: [
              { label: "Mon", value: 99.9 },
              { label: "Tue", value: 99.95 },
              { label: "Wed", value: 99.8 },
              { label: "Thu", value: 99.99 },
              { label: "Fri", value: 99.99 },
              { label: "Sat", value: 100 },
              { label: "Sun", value: 100 }
            ],
            x: 50,
            y: 100,
            width: 924,
            height: 350
          },
          {
            id: "pm-t-7",
            type: "text",
            content: "UNWAVERING RELIABILITY",
            x: 50,
            y: 10,
            width: 924,
            height: 60,
            fontSize: 32,
            fontWeight: "900",
            color: "#000000",
            textAlign: "center"
          }
        ]
      },
      {
        id: 5,
        bgColor: "#000000",
        elements: [
          {
            id: "pm-chart-5",
            type: "pie-chart",
            chartTitle: "ERROR CATEGORIES",
            chartData: [
              { label: "Network", value: 40, color: "#3b82f6" },
              { label: "Logic", value: 25, color: "#f59e0b" },
              { label: "Auth", value: 20, color: "#10b981" },
              { label: "Others", value: 15, color: "#ef4444" }
            ],
            x: 50,
            y: 100,
            width: 450,
            height: 350
          },
          {
            id: "pm-t-9",
            type: "text",
            content: "STABILITY INSIGHTS",
            x: 562,
            y: 150,
            width: 412,
            height: 60,
            fontSize: 48,
            fontWeight: "900",
            color: "#ffffff",
            textAlign: "left"
          },
          {
            id: "pm-t-10",
            type: "text",
            content: "By categorizing system errors, we can deploy targeted patches to our most vulnerable subsystems. Network stability remains our highest priority for the upcoming sprint cycle.",
            x: 562,
            y: 270,
            width: 412,
            height: 250,
            fontSize: 18,
            fontWeight: "500",
            color: "rgba(255,255,255,0.6)",
            textAlign: "left"
          }
        ]
      },
      {
        id: 6,
        bgColor: "#000000",
        elements: [
          {
            id: "pm-t-11",
            type: "text",
            content: "STRATEGIC ALIGNMENT",
            x: 0,
            y: 150,
            width: 1024,
            height: 120,
            fontSize: 64,
            fontWeight: "1000",
            color: "#ffffff",
            textAlign: "center"
          },
          {
            id: "pm-t-12",
            type: "text",
            content: "All metrics converge toward our 2025 vision. By aligning localized performance with global strategic objectives, we ensure that every unit of energy spent contributes to the long-term resilience and value of the enterprise.",
            x: 212,
            y: 320,
            width: 600,
            height: 200,
            fontSize: 22,
            fontWeight: "500",
            color: "rgba(255,255,255,0.6)",
            textAlign: "center"
          }
        ]
      },
      {
        id: 7,
        bgColor: "#ffffff",
        elements: [
          {
            id: "pm-table-1",
            type: "table",
            tableBgColor: "#ffffff",
            borderColor: "#e5e7eb",
            color: "#111827",
            tableData: [
              [{ text: "Metric", isHeader: true }, { text: "Status", isHeader: true }, { text: "Trend", isHeader: true }],
              [{ text: "Security" }, { text: "Optimum" }, { text: "+12%" }],
              [{ text: "Agility" }, { text: "High" }, { text: "+25%" }],
              [{ text: "Support" }, { text: "Critical" }, { text: "+40%" }],
              [{ text: "UX Score" }, { text: "High" }, { text: "+8%" }]
            ],
            x: 50,
            y: 100,
            width: 500,
            height: 350
          },
          {
            id: "pm-t-13",
            type: "text",
            content: "DIFFERENTIATION LOG",
            x: 562,
            y: 120,
            width: 412,
            height: 100,
            fontSize: 44,
            fontWeight: "900",
            color: "#000000",
            textAlign: "left"
          },
          {
            id: "pm-t-14",
            type: "text",
            content: "Our performance logs highlight a clear lead in customer support and operational security. These metrics are not just numbers; they are the indicators of our long-term market resilience and our commitment to architectural excellence.",
            x: 562,
            y: 250,
            width: 412,
            height: 250,
            fontSize: 18,
            fontWeight: "500",
            color: "#666666",
            textAlign: "left"
          }
        ]
      },
      {
        id: 8,
        bgColor: "#000000",
        elements: [
          {
            id: "pm-chart-8",
            type: "line-chart",
            chartTitle: "MARKET SHARE PROJECTION",
            chartData: [
              { label: "2021", value: 10, color: "#ffffff" },
              { label: "2022", value: 18, color: "#ffffff" },
              { label: "2023", value: 30, color: "#ffffff" },
              { label: "2024", value: 45, color: "#ffffff" }
            ],
            x: 50,
            y: 100,
            width: 500,
            height: 350
          },
          {
            id: "pm-t-15",
            type: "text",
            content: "ASCENDANT MOMENTUM",
            x: 562,
            y: 150,
            width: 412,
            height: 60,
            fontSize: 48,
            fontWeight: "900",
            color: "#ffffff",
            textAlign: "right"
          },
          {
            id: "pm-t-16",
            type: "text",
            content: "The trajectory is clear. By maintaining our current velocity of innovation and regional expansion, we are on track to capture nearly half of the addressable market by the end of next year. Our growth is not just fast; it is sustainable.",
            x: 562,
            y: 270,
            width: 412,
            height: 250,
            fontSize: 18,
            fontWeight: "500",
            color: "rgba(255,255,255,0.6)",
            textAlign: "right"
          }
        ]
      },
      {
        id: 99,
        bgColor: "#ffffff",
        elements: [
          {
            id: "pm-end-t1",
            type: "text",
            content: "MEASURE. IMPROVE. REPEAT.",
            x: 0,
            y: 150,
            width: 1024,
            height: 120,
            fontSize: 56,
            fontWeight: "1000",
            color: "#000000",
            textAlign: "center"
          },
          {
            id: "pm-end-t2",
            type: "text",
            content: "Data is the map, but your vision is the compass.",
            x: 212,
            y: 320,
            width: 600,
            height: 150,
            fontSize: 22,
            fontWeight: "600",
            color: "#f59e0b",
            textAlign: "center"
          }
        ]
      }
    ]
  }
];
