# MA Crossings
golden_cross = {
    'name': 'Golden Cross',
    'is_public': True,
    'is_dynamic': True,
    'type': 'buy',
    'tags': ["sma_close50", "sma_close200"],
    'desc': '• [MMA 50] superou a [MMA 200].\n'
            '\n'
            '• Glossário:\n'
            '  .. MMA = Média Móvel Aritmética ou Simples\n'
            '\n'
            '#cruzamento #mediaMovel #crossing #movingAverage',
    'rules': {
        "basic_0": {
            "and": [
                {
                    ">": [
                        {
                            "var": "<interval>_sma_close50__p0"
                        },
                        {
                            "var": "<interval>_sma_close200__p0"
                        }
                    ]
                }
            ]
        },
        "basic_1": {
            "and": [
                {
                    ">": [
                        {
                            "var": "<interval>_sma_close200__p1"
                        },
                        {
                            "var": "<interval>_sma_close50__p1"
                        }
                    ]
                }
            ]
        },
        "advanced": {}
    }
}
death_cross = {
    'name': 'Death Cross',
    'is_public': True,
    'is_dynamic': True,
    'type': 'sell',
    'tags': ["sma_close50", "sma_close200"],
    'desc': '• [MMA 50] atravessou [MMA 200] para baixo.\n'
            '\n'
            '• Glossário:\n'
            '  .. MMA = Média Móvel Aritmética ou Simples\n'
            '\n'
            '#cruzamento #mediaMovel #crossing #movingAverage',
    'rules': {
        "basic_0": {
            "and": [
                {
                    ">": [
                        {
                            "var": "<interval>_sma_close200__p0"
                        },
                        {
                            "var": "<interval>_sma_close50__p0"
                        }
                    ]
                }
            ]
        },
        "basic_1": {
            "and": [
                {
                    ">": [
                        {
                            "var": "<interval>_sma_close50__p1"
                        },
                        {
                            "var": "<interval>_sma_close200__p1"
                        }
                    ]
                }
            ]
        },
        "advanced": {}
    }
}
crossing_mme8_mme17_long = {
    'name': 'MME 8 -> MME 17',
    'is_public': True,
    'is_dynamic': True,
    'type': 'buy',
    'tags': ["ema_close8", "ema_close17", "ema_close72"],
    'desc': '• [MME 8] superou a [MME 17], com o suporte da [MME 72].\n'
            '• Com a inclinação positiva da [MME 72], dando suporte ao preço, consideramos que o ativo segue em tendência de alta.\n'
            '\n'
            '• Glossário:\n'
            '  .. MME = Média Móvel Exponencial\n'
            '\n'
            '#cruzamento #mediaMovel #crossing #movingAverage',
    'rules': {
        "basic_0": {
            "and": [
                {
                    ">": [
                        {
                            "var": "<interval>_ema_close8__p0"
                        },
                        {
                            "var": "<interval>_ema_close17__p0"
                        }
                    ]
                },
                {
                    ">": [
                        {
                            "var": "<interval>_ema_close17__p0"
                        },
                        {
                            "var": "<interval>_ema_close72__p0"
                        }
                    ]
                }
            ]
        },
        "basic_1": {
            "and": [
                {
                    ">": [
                        {
                            "var": "<interval>_ema_close17__p1"
                        },
                        {
                            "var": "<interval>_ema_close8__p1"
                        }
                    ]
                }
            ]
        },
        "advanced": {
            "and": [
                {
                    "slope": {
                        ">": [
                            {
                                "var": "<interval>_ema_close72__p0"
                            },
                            {
                                "var": "<interval>_ema_close72__p1"
                            }
                        ]
                    }
                }
            ]
        }
    }
}
crossing_mme8_mme17_short = {
    'name': 'MME 17 -> MME 8',
    'is_public': True,
    'is_dynamic': True,
    'type': 'sell',
    'tags': ["ema_close72", "ema_close17", "ema_close8"],
    'desc': '• [MME 8] atravessou a [MME 17] para baixo, com a [MME 72] apoiando o movimento.\n'
            '• Com a inclinação negativa da [MME 72], servindo de resistência ao preço, consideramos que o ativo segue em tendência de baixa.\n'
            '\n'
            '• Glossário:\n'
            '  .. MME = Média Móvel Exponencial\n'
            '\n'
            '#cruzamento #mediaMovel #crossing #movingAverage',
    'rules': {
        "basic_0": {
            "and": [
                {
                    ">": [
                        {
                            "var": "<interval>_ema_close72__p0"
                        },
                        {
                            "var": "<interval>_ema_close17__p0"
                        }
                    ]
                },
                {
                    ">": [
                        {
                            "var": "<interval>_ema_close17__p0"
                        },
                        {
                            "var": "<interval>_ema_close8__p0"
                        }
                    ]
                }
            ]
        },
        "basic_1": {
            "and": [
                {
                    ">": [
                        {
                            "var": "<interval>_ema_close8__p1"
                        },
                        {
                            "var": "<interval>_ema_close17__p1"
                        }
                    ]
                }
            ]
        },
        "advanced": {
            "and": [
                {
                    "slope": {
                        "<": [
                            {
                                "var": "<interval>_ema_close72__p0"
                            },
                            {
                                "var": "<interval>_ema_close72__p1"
                            }
                        ]
                    }
                }
            ]
        }
    }
}
crossing_mme9_mma21_long = {
    'name': 'MME 9 -> MMA 21',
    'is_public': True,
    'is_dynamic': True,
    'type': 'buy',
    'tags': ["ema_close9", "sma_close21", "sma_close200"],
    'desc': '• [MME 9] superou a [MMA 21], com o suporte da [MMA 200].\n'
            '• Com a inclinação positiva da [MMA 200], dando suporte ao preço, consideramos que o ativo segue em tendência de alta.\n'
            '\n'
            '• Glossário:\n'
            '  .. MMA = Média Móvel Aritmética ou Simples\n'
            '  .. MME = Média Móvel Exponencial\n'
            '\n'
            '#cruzamento #mediaMovel #crossing #movingAverage',
    'rules': {
        "basic_0": {
            "and": [
                {
                    ">": [
                        {
                            "var": "<interval>_ema_close9__p0"
                        },
                        {
                            "var": "<interval>_sma_close21__p0"
                        }
                    ]
                },
                {
                    ">": [
                        {
                            "var": "<interval>_sma_close21__p0"
                        },
                        {
                            "var": "<interval>_sma_close200__p0"
                        }
                    ]
                }
            ]
        },
        "basic_1": {
            "and": [
                {
                    ">": [
                        {
                            "var": "<interval>_sma_close21__p1"
                        },
                        {
                            "var": "<interval>_ema_close9__p1"
                        }
                    ]
                }
            ]
        },
        "advanced": {
            "and": [
                {
                    "slope": {
                        ">": [
                            {
                                "var": "<interval>_sma_close200__p0"
                            },
                            {
                                "var": "<interval>_sma_close200__p1"
                            }
                        ]
                    }
                }
            ]
        }
    }
}
crossing_mme9_mma21_short = {
    'name': 'MMA 21 -> MME 9',
    'is_public': True,
    'is_dynamic': True,
    'type': 'sell',
    'tags': ["sma_close200", "sma_close21", "ema_close9"],
    'desc': '• [MME 9] atravessou a [MMA 21] para baixo, com a [MMA 200] apoiando o movimento.\n'
            '• Com a inclinação negativa da [MMA 200], servindo como mais uma resistência ao preço, consideramos que o ativo segue em tendência de baixa.\n'
            '\n'
            '• Glossário:\n'
            '  .. MMA = Média Móvel Aritmética ou Simples\n'
            '  .. MME = Média Móvel Exponencial\n'
            '\n'
            '#cruzamento #mediaMovel #crossing #movingAverage',
    'rules': {
        "basic_0": {
            "and": [
                {
                    ">": [
                        {
                            "var": "<interval>_sma_close200__p0"
                        },
                        {
                            "var": "<interval>_sma_close21__p0"
                        }
                    ]
                },
                {
                    ">": [
                        {
                            "var": "<interval>_sma_close21__p0"
                        },
                        {
                            "var": "<interval>_ema_close9__p0"
                        }
                    ]
                }
            ]
        },
        "basic_1": {
            "and": [
                {
                    ">": [
                        {
                            "var": "<interval>_ema_close9__p1"
                        },
                        {
                            "var": "<interval>_sma_close21__p1"
                        }
                    ]
                }
            ]
        },
        "advanced": {
            "and": [
                {
                    "slope": {
                        "<": [
                            {
                                "var": "<interval>_sma_close200__p0"
                            },
                            {
                                "var": "<interval>_sma_close200__p1"
                            }
                        ]
                    }
                }
            ]
        }
    }
}
crossing_mme17_mme72_long = {
    'name': 'MME 17 -> MME 72',
    'is_public': True,
    'is_dynamic': True,
    'type': 'buy',
    'tags': ["ema_close17", "ema_close72"],
    'desc': '• [MME 17] superou a [MME 72].\n'
            '\n'
            '• Glossário:\n'
            '  .. MME = Média Móvel Exponencial\n'
            '\n'
            '#cruzamento #mediaMovel #crossing #movingAverage',
    'rules': {
        "basic_0": {
            "and": [
                {
                    ">": [
                        {
                            "var": "<interval>_ema_close17__p0"
                        },
                        {
                            "var": "<interval>_ema_close72__p0"
                        }
                    ]
                }
            ]
        },
        "basic_1": {
            "and": [
                {
                    ">": [
                        {
                            "var": "<interval>_ema_close72__p1"
                        },
                        {
                            "var": "<interval>_ema_close17__p1"
                        }
                    ]
                }
            ]
        },
        "advanced": {}
    }
}
crossing_mme17_mme72_short = {
    'name': 'MME 72 -> MME 17',
    'is_public': True,
    'is_dynamic': True,
    'type': 'sell',
    'tags': ["ema_close72", "ema_close17"],
    'desc': '• [MME 17] atravessou a [MME 72] para baixo.\n'
            '\n'
            '• Glossário:\n'
            '  .. MME = Média Móvel Exponencial\n'
            '\n'
            '#cruzamento #mediaMovel #crossing #movingAverage',
    'rules': {
        "basic_0": {
            "and": [
                {
                    ">": [
                        {
                            "var": "<interval>_ema_close72__p0"
                        },
                        {
                            "var": "<interval>_ema_close17__p0"
                        }
                    ]
                }
            ]
        },
        "basic_1": {
            "and": [
                {
                    ">": [
                        {
                            "var": "<interval>_ema_close17__p1"
                        },
                        {
                            "var": "<interval>_ema_close72__p1"
                        }
                    ]
                }
            ]
        },
        "advanced": {}
    }
}
# Larry Williams
larry_williams_9_1_long = {
    'name': '[Compra] 9.1',
    'is_public': True,
    'is_dynamic': True,
    'type': 'buy',
    'tags': ["close", "ema_close9", "low"],
    'desc': '• Um dos mais famosos do autor, o Setup 9.1 de Larry Williams procura por movimentos de reversão do preço.\n'
            '• Nesta Estratégia de Compra, a [MME 9] reverte inclinação e o [Preço] acabou de superar a [MME 9].\n'
            '\n'
            '• Contexto:\n'
            '  1. [Preço] estava caindo abaixo da [MME 9], que também estava inclinada para baixo.\n'
            '  2. [Preço] começou a reverter sua direção.\n'
            '  3. [Preço] supera a [MME 9], que também começa a se inclinar para cima. [Candle R1]\n'
            '\n'
            'Quando entrar? Quando o [Preço] romper a [Máxima] do [Candle R1].\n'
            'Stop Loss? Na [Mínima] do [Candle R1].\n'
            '\n'
            '• Glossário:\n'
            '  .. MME = Média Móvel Exponencial\n'
            '  .. Candle R* = Candle ou período de tempo considerado como Referência para o setup.\n'
            '\n'
            '#classics #LarryWilliams #9.1 #mediaMovel',
    'rules': {
        "basic_0": {
            "and": [
                {
                    ">": [
                        {
                            "var": "<interval>_close__p0"
                        },
                        {
                            "var": "<interval>_ema_close9__p0"
                        }
                    ]
                },
                {
                    ">": [
                        {
                            "var": "<interval>_ema_close9__p0"
                        },
                        {
                            "var": "<interval>_low__p0"
                        }
                    ]
                }
            ]
        },
        "basic_1": {},
        "advanced": {
            "and": [
                {
                    "slope": {
                        "<": [
                            {
                                "var": "<interval>_ema_close9__p3"
                            },
                            {
                                "var": "<interval>_ema_close9__p4"
                            }
                        ]
                    }
                },
                {
                    "slope": {
                        "<": [
                            {
                                "var": "<interval>_ema_close9__p2"
                            },
                            {
                                "var": "<interval>_ema_close9__p3"
                            }
                        ]
                    }
                },
                {
                    "slope": {
                        ">": [
                            {
                                "var": "<interval>_ema_close9__p0"
                            },
                            {
                                "var": "<interval>_ema_close9__p1"
                            }
                        ]
                    }
                }
            ]
        }
    }
}
larry_williams_9_1_short = {
    'name': '[Venda] 9.1',
    'is_public': True,
    'is_dynamic': True,
    'type': 'sell',
    'tags': ["high", "ema_close9", "close"],
    'desc': '• Um dos mais famosos do autor, o Setup 9.1 de Larry Williams procura por movimentos de reversão do preço.\n'
            '• Nesta Estratégia de Venda, a[MME 9] reverte inclinação e o [Preço] acabou de atravessar a [MME 9] para baixo.\n'
            '\n'
            '• Contexto:\n'
            '  1. [Preço] estava subindo acima da [MME 9], que também estava inclinada para cima.\n'
            '  2. [Preço] começou a reverter sua direção.\n'
            '  3. [Preço] atravessa a [MME 9] para baixo, que também começa a se inclinar para baixo. [Candle R1]\n'
            '\n'
            'Quando entrar? Quando o [Preço] romper a [Mínima] do [Candle R1].\n'
            'Stop Loss? Na [Máxima] do [Candle R1].\n'
            '\n'
            '• Glossário:\n'
            '  .. MME = Média Móvel Exponencial\n'
            '  .. Candle R* = Candle ou período de tempo considerado como Referência para o setup.\n'
            '\n'
            '#classics #LarryWilliams #9.1 #mediaMovel',
    'rules': {
        "basic_0": {
            "and": [
                {
                    ">": [
                        {
                            "var": "<interval>_high__p0"
                        },
                        {
                            "var": "<interval>_ema_close9__p0"
                        }
                    ]
                },
                {
                    ">": [
                        {
                            "var": "<interval>_ema_close9__p0"
                        },
                        {
                            "var": "<interval>_close__p0"
                        }
                    ]
                }
            ]
        },
        "basic_1": {},
        "advanced": {
            "and": [
                {
                    "slope": {
                        ">": [
                            {
                                "var": "<interval>_ema_close9__p3"
                            },
                            {
                                "var": "<interval>_ema_close9__p4"
                            }
                        ]
                    }
                },
                {
                    "slope": {
                        ">": [
                            {
                                "var": "<interval>_ema_close9__p2"
                            },
                            {
                                "var": "<interval>_ema_close9__p3"
                            }
                        ]
                    }
                },
                {
                    "slope": {
                        "<": [
                            {
                                "var": "<interval>_ema_close9__p0"
                            },
                            {
                                "var": "<interval>_ema_close9__p1"
                            }
                        ]
                    }
                }
            ]
        }
    }
}
larry_williams_9_2_9_3_long = {
    'name': '[Compra] 9.2 e 9.3',
    'is_public': True,
    'is_dynamic': True,
    'type': 'buy',
    'tags': ["high", "ema_close9", "low"],
    'desc': '• [Preço] em tendência de alta sofre pequeno pullback, se aproxima da [MME 9] e pode retomar tendência.\n'
            '\n'
            '• Contexto:\n'
            '  1. Ativo em tendência de alta. [Candle R1] é o candle com maior [Máxima] do movimento.\n'
            '  2. [Preço] fez pequeno pullback.\n'
            '  3. [MME 9] e [Mínima] ficam muito próximas (0,38%). [Candle R2] é o candle mais próximo da [MME 9]\n'
            '  4. Em todo o momento, [MME 9] permanece inclinada para cima.\n'
            '\n'
            'Quando entrar?\n'
            '  .. 9.2: Quando o [Preço] romper a [Máxima] do [Candle R2].\n'
            '  .. 9.3: Quando o [Preço] romper a [Máxima] do [Candle R1].\n'
            'Stop Loss? Na [Mínima] do [Candle R2].\n'
            '\n'
            '• Glossário:\n'
            '  .. MME = Média Móvel Exponencial\n'
            '  .. Candle R* = Candle ou período de tempo considerado como Referência para o setup.\n'
            '\n'
            '#classics #LarryWilliams #9.2 #9.3 #mediaMovel',
    'rules': {
        "basic_0": {
            "and": [
                {
                    ">": [
                        {
                            "var": "<interval>_high__p0"
                        },
                        {
                            "var": "<interval>_ema_close9__p0"
                        }
                    ]
                }
            ]
        },
        "basic_1": {},
        "advanced": {
            "and": [
                {
                    "slope": {
                        ">": [
                            {
                                "var": "<interval>_ema_close9__p3"
                            },
                            {
                                "var": "<interval>_ema_close9__p4"
                            }
                        ]
                    }
                },
                {
                    "slope": {
                        ">": [
                            {
                                "var": "<interval>_ema_close9__p0"
                            },
                            {
                                "var": "<interval>_ema_close9__p1"
                            }
                        ]
                    }
                },
                {
                    "distance": {
                        "distance": [
                            {
                                "var": "<interval>_ema_close9__p0"
                            },
                            {
                                "var": "<interval>_low__p0"
                            },
                            {
                                "perc": 0.38
                            }
                        ]
                    }
                },
                {
                    "comparison": {
                        ">=": [
                            {
                                "var": "<interval>_high__p1"
                            },
                            {
                                "var": "<interval>_high__p0"
                            }
                        ]
                    }
                },
                {
                    "comparison": {
                        ">=": [
                            {
                                "var": "<interval>_low__p1"
                            },
                            {
                                "var": "<interval>_low__p0"
                            }
                        ]
                    }
                }
            ]
        }
    }
}
larry_williams_9_2_9_3_short = {
    'name': '[Venda] 9.2 e 9.3',
    'is_public': True,
    'is_dynamic': True,
    'type': 'sell',
    'tags': ["ema_close9", "low", "high"],
    'desc': '• [Preço] em tendência de baixa sofre pequeno pullback, se aproxima da [MME 9] e pode retomar tendência.\n'
            '\n'
            '• Contexto:\n'
            '  1. Ativo em tendência de baixa. [Candle R1] é o candle com menor [Mínima] do movimento.\n'
            '  2. [Preço] fez pequeno pullback.\n'
            '  3. [MME 9] e [Máxima] estão muito próximas (distância <= 0,38%). [Candle R2] é o candle mais próximo da [MME 9]\n'
            '  4. Em todo o momento, [MME 9] permanece inclinada para baixo.\n'
            '\n'
            'Quando entrar?\n'
            '  .. 9.2: Quando o [Preço] romper a [Mínima] do [Candle R2].\n'
            '  .. 9.3: Quando o [Preço] romper a [Mínima] do [Candle R1].\n'
            'Stop Loss? Na [Máxima] do [Candle R2].\n'
            '\n'
            '• Glossário:\n'
            '  .. MME = Média Móvel Exponencial\n'
            '  .. Candle R* = Candle ou período de tempo considerado como Referência para o setup.\n'
            '\n'
            '#classics #LarryWilliams #9.2 #9.3 #mediaMovel',
    'rules': {
        "basic_0": {
            "and": [
                {
                    ">": [
                        {
                            "var": "<interval>_ema_close9__p0"
                        },
                        {
                            "var": "<interval>_low__p0"
                        }
                    ]
                }
            ]
        },
        "basic_1": {},
        "advanced": {
            "and": [
                {
                    "slope": {
                        "<": [
                            {
                                "var": "<interval>_ema_close9__p3"
                            },
                            {
                                "var": "<interval>_ema_close9__p4"
                            }
                        ]
                    }
                },
                {
                    "slope": {
                        "<": [
                            {
                                "var": "<interval>_ema_close9__p0"
                            },
                            {
                                "var": "<interval>_ema_close9__p1"
                            }
                        ]
                    }
                },
                {
                    "distance": {
                        "distance": [
                            {
                                "var": "<interval>_ema_close9__p0"
                            },
                            {
                                "var": "<interval>_high__p0"
                            },
                            {
                                "perc": 0.38
                            }
                        ]
                    }
                },
                {
                    "comparison": {
                        "<=": [
                            {
                                "var": "<interval>_low__p1"
                            },
                            {
                                "var": "<interval>_low__p0"
                            }
                        ]
                    }
                },
                {
                    "comparison": {
                        "<=": [
                            {
                                "var": "<interval>_high__p1"
                            },
                            {
                                "var": "<interval>_high__p0"
                            }
                        ]
                    }
                }
            ]
        }
    }
}
larry_williams_9_4_long = {
    'name': '[Compra] 9.4',
    'is_public': True,
    'is_dynamic': True,
    'type': 'buy',
    'tags': ["close", "ema_close9", "low"],
    'desc': '• Muito semelhante aos Setups 9.2 e 9.3, neste caso um pullback um pouco maior é esperado, o que provoca a mudança de direção da [MME 9].\n'
            '\n'
            '• Contexto:\n'
            '  1. Ativo em tendência de alta.\n'
            '  2. [Preço] fez pullback, chegando a atravessar a [MME 9], que fica levemente inclinada para baixo.\n'
            '  3. [Preço] supera a [MME 9], que também começa a se inclinar para cima novamente. [Candle R1]\n'
            '\n'
            'Quando entrar? Quando o [Preço] romper a [Máxima] do [Candle R1].\n'
            'Stop Loss? Na [Mínima] do [Candle R1].\n'
            '\n'
            '• Glossário:\n'
            '  .. MME = Média Móvel Exponencial\n'
            '  .. Candle R* = Candle ou período de tempo considerado como Referência para o setup.\n'
            '\n'
            '#classics #LarryWilliams #9.4 #mediaMovel',
    'rules': {
        "basic_0": {
            "and": [
                {
                    ">": [
                        {
                            "var": "<interval>_close__p0"
                        },
                        {
                            "var": "<interval>_ema_close9__p0"
                        }
                    ]
                }
            ]
        },
        "basic_1": {
            "and": [
                {
                    ">": [
                        {
                            "var": "<interval>_ema_close9__p1"
                        },
                        {
                            "var": "<interval>_close__p1"
                        }
                    ]
                }
            ]
        },
        "advanced": {
            "and": [
                {
                    "slope": {
                        ">": [
                            {
                                "var": "<interval>_ema_close9__p3"
                            },
                            {
                                "var": "<interval>_ema_close9__p4"
                            }
                        ]
                    }
                },
                {
                    "slope": {
                        "<": [
                            {
                                "var": "<interval>_ema_close9__p1"
                            },
                            {
                                "var": "<interval>_ema_close9__p2"
                            }
                        ]
                    }
                },
                {
                    "comparison": {
                        "<=": [
                            {
                                "var": "<interval>_low__p1"
                            },
                            {
                                "var": "<interval>_low__p0"
                            }
                        ]
                    }
                }
            ]
        }
    }
}
larry_williams_9_4_short = {
    'name': '[Venda] 9.4',
    'is_public': True,
    'is_dynamic': True,
    'type': 'sell',
    'tags': ["ema_close9", "close", "high"],
    'desc': '• Muito semelhante aos Setups 9.2 e 9.3, neste caso um pullback um pouco maior é esperado, o que provoca a mudança de direção da [MME 9].\n'
            '\n'
            '• Contexto:\n'
            '  1. Ativo em tendência de baixa.\n'
            '  2. [Preço] fez pullback, chegando a atravessar a [MME 9], que fica levemente inclinada para cima.\n'
            '  3. [Preço] atravessa a [MME 9] para baixo, que também começa a se inclinar para baixo novamente. [Candle R1]\n'
            '\n'
            'Quando entrar? Quando o [Preço] romper a [Mínima] do [Candle R1].\n'
            'Stop Loss? Na [Máxima] do [Candle R1].\n'
            '\n'
            '• Glossário:\n'
            '  .. MME = Média Móvel Exponencial\n'
            '  .. Candle R* = Candle ou período de tempo considerado como Referência para o setup.\n'
            '\n'
            '#classics #LarryWilliams #9.4 #mediaMovel',
    'rules': {
        "basic_0": {
            "and": [
                {
                    ">": [
                        {
                            "var": "<interval>_ema_close9__p0"
                        },
                        {
                            "var": "<interval>_close__p0"
                        }
                    ]
                }
            ]
        },
        "basic_1": {
            "and": [
                {
                    ">": [
                        {
                            "var": "<interval>_close__p1"
                        },
                        {
                            "var": "<interval>_ema_close9__p1"
                        }
                    ]
                }
            ]
        },
        "advanced": {
            "and": [
                {
                    "slope": {
                        "<": [
                            {
                                "var": "<interval>_ema_close9__p3"
                            },
                            {
                                "var": "<interval>_ema_close9__p4"
                            }
                        ]
                    }
                },
                {
                    "slope": {
                        ">": [
                            {
                                "var": "<interval>_ema_close9__p1"
                            },
                            {
                                "var": "<interval>_ema_close9__p2"
                            }
                        ]
                    }
                },
                {
                    "comparison": {
                        ">=": [
                            {
                                "var": "<interval>_high__p1"
                            },
                            {
                                "var": "<interval>_high__p0"
                            }
                        ]
                    }
                }
            ]
        }
    }
}
# Classis
pc_long = {
    'name': '[Compra] Ponto Contínuo',
    'is_public': True,
    'is_dynamic': True,
    'type': 'buy',
    'tags': ["high", "sma_close21", "low"],
    'desc': '• [Preço] em tendência de alta sofre pullback, se aproxima da [MMA 21] e pode retomar tendência.\n'
            '\n'
            '• Contexto:\n'
            '  1. Ativo em tendência de alta.\n'
            '  2. [Preço] fez pullback.\n'
            '  3. [MMA 21] e [Mínima] ficam muito próximas (0,38%). [Candle R1] é o candle mais próximo da [MMA 21].\n'
            '  4. Em todo o momento, [MMA 21] permanece inclinada para cima.\n'
            '\n'
            'Quando entrar? Quando o [Preço] romper a [Máxima] do [Candle R1].\n'
            'Stop Loss? Na [Mínima] do [Candle R1].\n'
            '\n'
            '• Glossário:\n'
            '  .. MMA = Média Móvel Aritmética ou Simples\n'
            '  .. Candle R* = Candle ou período de tempo considerado como Referência para o setup.\n'
            '\n'
            '#classics #PontoContinuo #PC #mediaMovel',
    'rules': {
        "basic_0": {
            "and": [
                {
                    ">": [
                        {
                            "var": "<interval>_high__p0"
                        },
                        {
                            "var": "<interval>_sma_close21__p0"
                        }
                    ]
                }
            ]
        },
        "basic_1": {},
        "advanced": {
            "and": [
                {
                    "slope": {
                        ">": [
                            {
                                "var": "<interval>_sma_close21__p3"
                            },
                            {
                                "var": "<interval>_sma_close21__p4"
                            }
                        ]
                    }
                },
                {
                    "slope": {
                        ">": [
                            {
                                "var": "<interval>_sma_close21__p0"
                            },
                            {
                                "var": "<interval>_sma_close21__p1"
                            }
                        ]
                    }
                },
                {
                    "distance": {
                        "distance": [
                            {
                                "var": "<interval>_sma_close21__p0"
                            },
                            {
                                "var": "<interval>_low__p0"
                            },
                            {
                                "perc": 0.38
                            }
                        ]
                    }
                },
                {
                    "comparison": {
                        ">=": [
                            {
                                "var": "<interval>_high__p1"
                            },
                            {
                                "var": "<interval>_high__p0"
                            }
                        ]
                    }
                },
                {
                    "comparison": {
                        ">=": [
                            {
                                "var": "<interval>_low__p1"
                            },
                            {
                                "var": "<interval>_low__p0"
                            }
                        ]
                    }
                }
            ]
        }
    }
}
pc_short = {
    'name': '[Venda] Ponto Contínuo',
    'is_public': True,
    'is_dynamic': True,
    'type': 'sell',
    'tags': ["high", "sma_close21", "low"],
    'desc': '• [Preço] em tendência de baixa sofre pullback, se aproxima da [MMA 21] e pode retomar tendência.\n'
            '\n'
            '• Contexto:\n'
            '  1. Ativo em tendência de baixa.\n'
            '  2. [Preço] fez pullback.\n'
            '  3. [MMA 21] e [Máxima] ficam muito próximas (0,38%). [Candle R1] é o candle mais próximo da [MMA 21].\n'
            '  4. Em todo o momento, [MMA 21] permanece inclinada para baixo.\n'
            '\n'
            'Quando entrar? Quando o [Preço] romper a [Mínima] do [Candle R1].\n'
            'Stop Loss? Na [Máxima] do [Candle R1].\n'
            '\n'
            '• Glossário:\n'
            '  .. MMA = Média Móvel Aritmética ou Simples\n'
            '  .. Candle R* = Candle ou período de tempo considerado como Referência para o setup.\n'
            '\n'
            '#classics #PontoContinuo #PC #mediaMovel',
    'rules': {
        "basic_0": {
            "and": [
                {
                    ">": [
                        {
                            "var": "<interval>_sma_close21__p0"
                        },
                        {
                            "var": "<interval>_low__p0"
                        }
                    ]
                }
            ]
        },
        "basic_1": {},
        "advanced": {
            "and": [
                {
                    "slope": {
                        "<": [
                            {
                                "var": "<interval>_sma_close21__p3"
                            },
                            {
                                "var": "<interval>_sma_close21__p4"
                            }
                        ]
                    }
                },
                {
                    "slope": {
                        "<": [
                            {
                                "var": "<interval>_sma_close21__p0"
                            },
                            {
                                "var": "<interval>_sma_close21__p1"
                            }
                        ]
                    }
                },
                {
                    "distance": {
                        "distance": [
                            {
                                "var": "<interval>_sma_close21__p0"
                            },
                            {
                                "var": "<interval>_high__p0"
                            },
                            {
                                "perc": 0.38
                            }
                        ]
                    }
                },
                {
                    "comparison": {
                        "<=": [
                            {
                                "var": "<interval>_low__p1"
                            },
                            {
                                "var": "<interval>_low__p0"
                            }
                        ]
                    }
                },
                {
                    "comparison": {
                        "<=": [
                            {
                                "var": "<interval>_high__p1"
                            },
                            {
                                "var": "<interval>_high__p0"
                            }
                        ]
                    }
                }
            ]
        }
    }
}
