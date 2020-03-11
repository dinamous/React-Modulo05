import React, { Component } from 'react';
import { FaGithubAlt, FaPlus, FaSpinner } from 'react-icons/fa';
import { Link } from 'react-router-dom';

// import { Title } from './styles';
import api from '../../services/api';
import Container from '../../components/Container';
import { Form, SubmitButton, List } from './styles';

export default class Main extends Component {
    state = {
        newRepo: '',
        repositories: [],
        loading: false,
        error: null,
        errorMessage: '',
    };

    // *carregar os dados do local storage
    componentDidMount() {
        const repositories = localStorage.getItem('repositories');

        if (repositories) {
            this.setState({ repositories: JSON.parse(repositories) });
        }
    }

    // *salvar os dados do local storage
    componentDidUpdate(_, prevState) {
        const { repositories } = this.state;

        if (prevState.repositories !== repositories) {
            localStorage.setItem('repositories', JSON.stringify(repositories));
        }
    }

    handleInputChange = e => {
        this.setState({ newRepo: e.target.value });
    };

    handleSubmit = async e => {
        e.preventDefault();
        this.setState({ loading: true, error: false });
        try {
            const { newRepo, repositories } = this.state;

            if (newRepo === '')
                throw Error('Você precisa indicar um repositório');

            const hasRepo = repositories.find(r => r.name === newRepo);

            if (hasRepo) throw Error('Repositório duplicado');

            try {
                const response = await api.get(`/repos/${newRepo}`);

                const data = {
                    name: response.data.full_name,
                };
                this.setState({
                    repositories: [...repositories, data],
                    newRepo: '',
                });
            } catch (error) {
                this.setState({
                    error: true,
                    errorMessage: 'Repositório não encontrado',
                });
            }
        } catch (error) {
            this.setState({ error: true, errorMessage: error.message });
        } finally {
            this.setState({ loading: false });
        }
    };

    render() {
        const {
            newRepo,
            repositories,
            loading,
            error,
            errorMessage,
        } = this.state;

        return (
            <Container>
                <h1>
                    <FaGithubAlt />
                    Repositórios
                </h1>

                <Form onSubmit={this.handleSubmit} error={error}>
                    <input
                        type="text"
                        placeholder="Adicioar repositório"
                        value={newRepo}
                        onChange={this.handleInputChange}
                    />

                    <SubmitButton loading={loading}>
                        {/* conditional rendering */}
                        {loading ? (
                            <FaSpinner color="#fff" size={14} />
                        ) : (
                            <FaPlus color="#fff" size={14} />
                        )}
                    </SubmitButton>
                </Form>
                <p>{errorMessage}</p>

                <List>
                    {repositories.map(repository => (
                        <li key={repository.name}>
                            <span>{repository.name}</span>
                            <Link
                                to={`/repository/${encodeURIComponent(
                                    repository.name
                                )}`}
                            >
                                Detalhes
                            </Link>
                        </li>
                    ))}
                </List>
            </Container>
        );
    }
}
