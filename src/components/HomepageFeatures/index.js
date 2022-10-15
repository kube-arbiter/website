import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

import Translate, {translate} from '@docusaurus/Translate';

const FeatureList = [
  {
    title: <Translate>Easy to Use</Translate>,
    Svg: require('@site/static/img/easy-to-use.svg').default,
    description: (
      <>
        <Translate>Define OBI(Observability Indicator) as first class model that can convert metrics/logging/tracing to an unified indicator. Use 'abctl' tool to check and use data easily.</Translate>
      </>
    ),
  },
  {
    title: <Translate>Designed to Extend</Translate>,
    Svg: require('@site/static/img/design-to-extend.svg').default,
    description: (
      <>
        <Translate>Provide a plugin framework that can integrate with different observability tools as input and generate OBI output. Introduce a context to let user extend scheduler easily using Javascript.</Translate>
      </>
    ),
  },
  {
    title: <Translate>Facilitate Scheduling and Scaling</Translate>,
    Svg: require('@site/static/img/scheduling-scaling.svg').default,
    description: (
      <>
        <Translate>OBI can be consumed by autoscaler like HPA/VPA, facilitate the requirements related to scaling.</Translate>
      </>
    ),
  },
  {
    title: <Translate>Trigger Actions</Translate>,
    Svg: require('@site/static/img/trigger-action.svg').default,
    description: (
      <>
        <Translate>Allow to trigger custom actions based on OBI, help to mark resource status using different rules or automate manual works.</Translate>
      </>
    ),
  },
  {
    title: <Translate>Out-of-the-box Plugins</Translate>,
    Svg: require('@site/static/img/out-of-box-plugins.svg').default,
    description: (
      <>
       <Translate>Provide various out-of-the-box plugins from real user scenarios, to support various requirements and provide community support.</Translate>
      </>
    ),
  },
];

function Feature({Svg, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
