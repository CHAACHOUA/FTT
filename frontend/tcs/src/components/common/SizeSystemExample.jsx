import React from 'react';
import { Button, Input, Card, Badge } from './components/common';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faSave, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

const SizeSystemExample = () => {
  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h1 className="text-4xl font-bold">Système de Tailles Unifiées</h1>
      
      {/* Exemples de boutons avec différentes tailles */}
      <Card size="lg">
        <h2 className="text-2xl font-semibold mb-lg">Boutons avec différentes tailles</h2>
        <div className="flex gap-md flex-wrap">
          <Button size="xs" type="primary">Très petit</Button>
          <Button size="sm" type="primary">Petit</Button>
          <Button size="md" type="primary">Standard</Button>
          <Button size="lg" type="primary">Grand</Button>
          <Button size="xl" type="primary">Très grand</Button>
        </div>
      </Card>

      {/* Exemples d'inputs avec différentes tailles */}
      <Card size="lg">
        <h2 className="text-2xl font-semibold mb-lg">Inputs avec différentes tailles</h2>
        <div className="flex flex-col gap-md">
          <Input size="xs" placeholder="Champ très petit" />
          <Input size="sm" placeholder="Champ petit" />
          <Input size="md" placeholder="Champ standard" />
          <Input size="lg" placeholder="Champ grand" />
        </div>
      </Card>

      {/* Exemples de badges avec différentes tailles */}
      <Card size="lg">
        <h2 className="text-2xl font-semibold mb-lg">Badges avec différentes tailles</h2>
        <div className="flex gap-md flex-wrap items-center">
          <Badge size="xs" type="status" variant="success">Très petit</Badge>
          <Badge size="sm" type="status" variant="success">Petit</Badge>
          <Badge size="md" type="status" variant="success">Standard</Badge>
          <Badge size="lg" type="status" variant="success">Grand</Badge>
        </div>
      </Card>

      {/* Exemples de cartes avec différentes tailles */}
      <div className="grid grid-cols-2 gap-lg">
        <Card size="sm">
          <h3 className="text-lg font-semibold">Petite carte</h3>
          <p className="text-sm">Contenu de la petite carte</p>
        </Card>
        
        <Card size="md">
          <h3 className="text-lg font-semibold">Carte standard</h3>
          <p className="text-sm">Contenu de la carte standard</p>
        </Card>
        
        <Card size="lg">
          <h3 className="text-lg font-semibold">Grande carte</h3>
          <p className="text-sm">Contenu de la grande carte</p>
        </Card>
        
        <Card size="xl">
          <h3 className="text-lg font-semibold">Très grande carte</h3>
          <p className="text-sm">Contenu de la très grande carte</p>
        </Card>
      </div>

      {/* Exemples avec icônes */}
      <Card size="lg">
        <h2 className="text-2xl font-semibold mb-lg">Composants avec icônes</h2>
        <div className="flex flex-col gap-md">
          <Button size="lg" type="primary" icon={<FontAwesomeIcon icon={faSave} />}>
            Sauvegarder
          </Button>
          <Input 
            size="md" 
            placeholder="Email" 
            icon={<FontAwesomeIcon icon={faEnvelope} />}
          />
          <div className="flex gap-md">
            <Button size="sm" type="success" icon={<FontAwesomeIcon icon={faEdit} />}>
              Modifier
            </Button>
            <Button size="sm" type="danger" icon={<FontAwesomeIcon icon={faTrash} />}>
              Supprimer
            </Button>
          </div>
        </div>
      </Card>

      {/* Exemples de variantes */}
      <Card size="lg">
        <h2 className="text-2xl font-semibold mb-lg">Variantes de composants</h2>
        <div className="flex flex-col gap-md">
          <div className="flex gap-md">
            <Button type="primary">Primary</Button>
            <Button type="secondary">Secondary</Button>
            <Button type="success">Success</Button>
            <Button type="danger">Danger</Button>
            <Button type="outline">Outline</Button>
          </div>
          
          <div className="flex gap-md">
            <Input variant="default" placeholder="Default" />
            <Input variant="filled" placeholder="Filled" />
            <Input variant="outlined" placeholder="Outlined" />
            <Input variant="ghost" placeholder="Ghost" />
          </div>
          
          <div className="flex gap-md">
            <Card variant="default" size="sm">Default</Card>
            <Card variant="elevated" size="sm">Elevated</Card>
            <Card variant="outlined" size="sm">Outlined</Card>
            <Card variant="filled" size="sm">Filled</Card>
          </div>
        </div>
      </Card>

      {/* Exemples d'états */}
      <Card size="lg">
        <h2 className="text-2xl font-semibold mb-lg">États des composants</h2>
        <div className="flex flex-col gap-md">
          <div className="flex gap-md">
            <Button type="primary">Normal</Button>
            <Button type="primary" disabled>Désactivé</Button>
            <Button type="primary" loading>Chargement</Button>
          </div>
          
          <div className="flex gap-md">
            <Input placeholder="Normal" />
            <Input placeholder="Désactivé" disabled />
            <Input placeholder="Erreur" error errorText="Ce champ est requis" />
            <Input placeholder="Succès" success successText="Champ valide" />
          </div>
        </div>
      </Card>

      {/* Exemples de classes utilitaires */}
      <Card size="lg">
        <h2 className="text-2xl font-semibold mb-lg">Classes utilitaires</h2>
        <div className="space-lg">
          <div className="text-xs">Texte très petit</div>
          <div className="text-sm">Texte petit</div>
          <div className="text-base">Texte standard</div>
          <div className="text-lg">Texte grand</div>
          <div className="text-xl">Texte très grand</div>
        </div>
        
        <div className="p-lg bg-gray-100 rounded-lg">
          <p className="text-base">Contenu avec padding et background</p>
        </div>
        
        <div className="flex gap-md items-center">
          <div className="w-full h-4 bg-blue-500 rounded-sm"></div>
          <div className="w-full h-6 bg-green-500 rounded-md"></div>
          <div className="w-full h-8 bg-red-500 rounded-lg"></div>
        </div>
      </Card>
    </div>
  );
};

export default SizeSystemExample;
