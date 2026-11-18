import test from 'node:test';
import assert from 'node:assert/strict';
import { chapters, glossary, lifecycle, preventionOptions, quizQuestions, sources, testTypes, transmissionFacts, virusLayers } from '../src/data.js';

test('learning path contains six unique chapters', () => {
  assert.equal(chapters.length, 6);
  assert.equal(new Set(chapters.map((chapter) => chapter.id)).size, 6);
});

test('HIV testing windows match current CDC guidance', () => {
  const windows = Object.fromEntries(testTypes.map((test) => [test.id, [test.start, test.end]]));
  assert.deepEqual(windows, { antibody: [23, 90], rapid: [18, 90], lab: [18, 45], nat: [10, 33] });
});

test('quiz contains six valid four-choice questions with explanations', () => {
  assert.equal(quizQuestions.length, 6);
  for (const question of quizQuestions) {
    assert.equal(question.options.length, 4);
    assert.ok(question.answer >= 0 && question.answer < 4);
    assert.ok(question.explanation.length > 40);
  }
});

test('life cycle contains seven ordered stages', () => {
  assert.equal(lifecycle.length, 7);
  assert.deepEqual(lifecycle.map((stage) => stage.title), ['Binding', 'Fusion', 'Reverse transcription', 'Integration', 'Replication', 'Assembly', 'Budding & maturation']);
});

test('every referenced official source uses HTTPS', () => {
  Object.values(sources).forEach((url) => assert.match(url, /^https:\/\//));
});

test('educational collections are complete', () => {
  assert.equal(virusLayers.length, 8);
  assert.equal(new Set(virusLayers.map((layer) => layer.id)).size, 8);
  virusLayers.forEach((layer) => assert.match(sources[layer.source], /^https:\/\/pmc\.ncbi\.nlm\.nih\.gov\//));
  assert.equal(transmissionFacts.filter((fact) => fact.possible).length, 4);
  assert.equal(transmissionFacts.filter((fact) => !fact.possible).length, 4);
  assert.equal(preventionOptions.length, 6);
  assert.equal(glossary.length, 6);
});
